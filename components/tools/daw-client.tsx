'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import { TransportBar } from '@/components/tools/daw/TransportBar'
import { TrackStrip, type TrackData } from '@/components/tools/daw/TrackStrip'
import { MixerPanel, type MixerTrack } from '@/components/tools/daw/MixerPanel'
import { DAWLayout } from '@/components/tools/daw/DAWLayout'
import { TimelineRuler } from '@/components/tools/daw/TimelineRuler'
import { TimelineMinimap } from '@/components/tools/daw/TimelineMinimap'
import { ArrangementGrid } from '@/components/tools/daw/ArrangementGrid'
import {
  getWaveformData,
  exportToWav,
  downloadBlob,
  sliceBuffer,
  concatBuffers,
  normalizeBufferForJoin,
} from '@/lib/daw/audio-utils'
import { nanoid } from 'nanoid'

const SAMPLE_RATE = 44100
const MAX_UNDO = 50
const MIN_PIXELS_PER_SECOND = 20
const MAX_PIXELS_PER_SECOND = 400
const DEFAULT_PIXELS_PER_SECOND = 80

const defaultEffects = () => ({
  eq: { enabled: false, freq: 1000, gain: 0 },
  reverb: { enabled: false, decay: 2, mix: 0.3 },
  delay: { enabled: false, time: 0.25, feedback: 0.5 },
})

export function DAWClient() {
  const [tracks, setTracks] = useState<TrackData[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [time, setTime] = useState('0:00.0')
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [playheadTime, setPlayheadTime] = useState(0)
  const [loopEnabled, setLoopEnabled] = useState(false)
  const [loopStart, setLoopStart] = useState(0)
  const [loopEnd, setLoopEnd] = useState(60)
  const [punchInEnabled, setPunchInEnabled] = useState(false)
  const [punchInTime, setPunchInTime] = useState(0)
  const [punchOutTime, setPunchOutTime] = useState(10)
  const [mixerOpen, setMixerOpen] = useState(true)
  const [undoStack, setUndoStack] = useState<TrackData[][]>([])
  const [redoStack, setRedoStack] = useState<TrackData[][]>([])
  const [pixelsPerSecond, setPixelsPerSecond] = useState(DEFAULT_PIXELS_PER_SECOND)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [timelineScrollLeft, setTimelineScrollLeft] = useState(0)
  const [timelineViewportWidth, setTimelineViewportWidth] = useState(800)
  /** Track ids excluded from Export joined (empty set = all audio tracks included). */
  const [joinExcludedIds, setJoinExcludedIds] = useState<Set<string>>(() => new Set())

  const timelineScrollRef = useRef<HTMLDivElement>(null)

  const playersRef = useRef<Map<string, { player: { stop: () => void } }>>(new Map())
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const animationRef = useRef<number>(0)

  const maxDuration = Math.max(0, ...tracks.map((t) => t.duration), loopEnd)
  const playheadProgress = maxDuration > 0 ? playheadTime / maxDuration : 0

  const pushUndo = useCallback((state: TrackData[]) => {
    const copy = state.map((t) => ({ ...t, waveform: new Float32Array(t.waveform), buffer: t.buffer }))
    setUndoStack((prev) => [...prev.slice(-MAX_UNDO), copy])
    setRedoStack([])
  }, [])

  const undo = useCallback(() => {
    if (undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    const redoState = tracks.map((t) => ({ ...t, waveform: new Float32Array(t.waveform), buffer: t.buffer }))
    setTracks(prev)
    setUndoStack((s) => s.slice(0, -1))
    setRedoStack((s) => [...s, redoState])
  }, [undoStack, tracks])

  const redo = useCallback(() => {
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    const undoState = tracks.map((t) => ({ ...t, waveform: new Float32Array(t.waveform), buffer: t.buffer }))
    setTracks(next)
    setRedoStack((s) => s.slice(0, -1))
    setUndoStack((s) => [...s, undoState])
  }, [redoStack, tracks])

  const initAudio = useCallback(async () => {
    if (audioContext) return
    const Tone = await import('tone')
    await Tone.start()
    setAudioContext((Tone as { getContext: () => { rawContext: AudioContext } }).getContext().rawContext)
    setIsReady(true)
  }, [audioContext])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 10)
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`
  }

  useEffect(() => {
    if (!isPlaying || !isReady) return
    const start = performance.now()

    const tick = () => {
      const elapsed = (performance.now() - start) / 1000
      let t = Math.min(elapsed, maxDuration)
      if (loopEnabled && t >= loopEnd) {
        t = loopStart + ((t - loopStart) % (loopEnd - loopStart))
      }
      setPlayheadTime(t)
      setTime(formatTime(t))
      if (!loopEnabled && elapsed >= maxDuration) {
        setIsPlaying(false)
        return
      }
      animationRef.current = requestAnimationFrame(tick)
    }
    animationRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationRef.current)
  }, [isPlaying, isReady, maxDuration, loopEnabled, loopStart, loopEnd])

  const [trackHeights, setTrackHeights] = useState<Record<string, number>>({})
  const defaultTrackHeight = 80

  const addTrack = useCallback(
    (buffer: AudioBuffer, name: string) => {
      pushUndo(tracks)
      const waveform = getWaveformData(buffer, 400)
      const track: TrackData = {
        id: nanoid(),
        name,
        type: 'audio',
        buffer,
        waveform,
        volume: 1,
        pan: 0,
        muted: false,
        solo: false,
        armed: false,
        duration: buffer.duration,
        effects: defaultEffects(),
      }
      setTracks((prev) => [...prev, track])
      setSelectedTrackId(track.id)
    },
    [tracks, pushUndo]
  )

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files?.length) return
      await initAudio()
      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
      for (const file of Array.from(files)) {
        const arrayBuffer = await file.arrayBuffer()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        addTrack(audioBuffer, file.name.replace(/\.[^/.]+$/, ''))
      }
      e.target.value = ''
    },
    [initAudio, addTrack]
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      const files = e.dataTransfer.files
      if (!files?.length) return
      await initAudio()
      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('audio/')) continue
        const arrayBuffer = await file.arrayBuffer()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        addTrack(audioBuffer, file.name.replace(/\.[^/.]+$/, ''))
      }
    },
    [initAudio, addTrack]
  )

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const play = useCallback(async () => {
    if (tracks.length === 0) return
    await initAudio()
    const Tone = await import('tone')

    for (const [, { player }] of playersRef.current) {
      player.stop()
    }
    playersRef.current.clear()

    const anySolo = tracks.some((t) => t.solo)
    const activeTracks = tracks.filter((t) => (anySolo ? t.solo : !t.muted))
    for (const track of activeTracks) {
      if ((track as TrackData & { type?: string }).type === 'midi') {
        const notes = (track as TrackData & { midiNotes?: { pitch: number; startTime: number; duration: number; velocity: number }[] }).midiNotes ?? []
        if (notes.length > 0) {
          const synth = new Tone.Synth().toDestination()
          for (const note of notes) {
            const freq = 440 * Math.pow(2, (note.pitch - 69) / 12)
            synth.triggerAttackRelease(freq, note.duration, note.startTime, note.velocity)
          }
        }
        continue
      }
      if (!track.buffer) continue
      const gain = new Tone.Gain(track.volume)
      gain.toDestination()
      const player = new Tone.Player(track.buffer).connect(gain)
      player.start(0)
      playersRef.current.set(track.id, { player })
    }

    Tone.getTransport().start()
    setIsPlaying(true)
  }, [tracks, initAudio])

  const pause = useCallback(async () => {
    const Tone = await import('tone')
    Tone.getTransport().pause()
    for (const [, { player }] of playersRef.current) {
      player.stop()
    }
    playersRef.current.clear()
    setIsPlaying(false)
  }, [])

  const stop = useCallback(async () => {
    const Tone = await import('tone')
    Tone.getTransport().stop()
    for (const [, { player }] of playersRef.current) {
      player.stop()
    }
    playersRef.current.clear()
    setIsPlaying(false)
    setPlayheadTime(0)
    setTime('0:00.0')
  }, [])

  const record = useCallback(async () => {
    if (isRecording) {
      recorderRef.current?.stop()
      setIsRecording(false)
      return
    }
    await initAudio()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recordedChunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        if (recordedChunksRef.current.length === 0) return
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' })
        const arrayBuffer = await blob.arrayBuffer()
        const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        addTrack(audioBuffer, `Recording ${new Date().toISOString().slice(11, 19)}`)
      }
      recorder.start()
      recorderRef.current = recorder
      setIsRecording(true)
    } catch (err) {
      console.error('Mic access denied:', err)
      toast.error('Microphone access denied. Please allow mic permission to record.')
    }
  }, [isRecording, initAudio, addTrack])

  const exportWav = useCallback(async () => {
    if (tracks.length === 0 || maxDuration <= 0) return
    await initAudio()
    const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
    const length = Math.ceil(maxDuration * SAMPLE_RATE)
    const outputBuffer = ctx.createBuffer(1, length, SAMPLE_RATE)
    const outputData = outputBuffer.getChannelData(0)
    outputData.fill(0)

    for (const track of tracks) {
      if (!track.buffer || track.muted) continue
      if (tracks.some((t) => t.solo) && !track.solo) continue
      const ch0 = track.buffer.getChannelData(0)
      const ch1 = track.buffer.numberOfChannels > 1 ? track.buffer.getChannelData(1) : ch0
      const vol = track.volume * (1 - Math.abs(track.pan ?? 0) * 0.5)
      for (let i = 0; i < Math.min(track.buffer.length, length); i++) {
        outputData[i] += ((ch0[i] ?? 0) + (ch1?.[i] ?? ch0[i] ?? 0)) * 0.5 * vol
      }
    }

    const max = Math.max(...Array.from(outputData).map(Math.abs), 0.001)
    for (let i = 0; i < outputData.length; i++) {
      outputData[i] /= max
    }

    const blob = exportToWav(outputBuffer, SAMPLE_RATE)
    downloadBlob(blob, `mix-${Date.now()}.wav`)
    toast.success('Mix exported successfully')
  }, [tracks, maxDuration, initAudio])

  const exportStems = useCallback(async () => {
    if (tracks.length === 0) return
    await initAudio()
    const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
    for (const track of tracks) {
      if (!track.buffer) continue
      const blob = exportToWav(track.buffer, SAMPLE_RATE)
      downloadBlob(blob, `stem-${track.name.replace(/\s+/g, '-')}-${Date.now()}.wav`)
    }
    toast.success(`Exported ${tracks.length} stems`)
  }, [tracks, initAudio])

  const audioTracksForJoin = useMemo(
    () =>
      tracks.filter(
        (t) => (t.type ?? 'audio') === 'audio' && t.buffer && !joinExcludedIds.has(t.id)
      ),
    [tracks, joinExcludedIds]
  )
  const canExportJoined = audioTracksForJoin.length > 0

  const exportJoinedWav = useCallback(async () => {
    if (audioTracksForJoin.length === 0) {
      toast.error('No audio tracks to join (check Join column)')
      return
    }
    await initAudio()
    const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
    try {
      const normalized: AudioBuffer[] = []
      for (const t of audioTracksForJoin) {
        normalized.push(await normalizeBufferForJoin(t.buffer!, SAMPLE_RATE, 2))
      }
      const joined = concatBuffers(ctx, normalized, SAMPLE_RATE)
      const blob = exportToWav(joined, SAMPLE_RATE)
      downloadBlob(blob, `joined-${Date.now()}.wav`)
      toast.success('Joined WAV exported')
    } catch (e) {
      console.error(e)
      toast.error('Could not build joined file')
    } finally {
      await ctx.close()
    }
  }, [audioTracksForJoin, initAudio])

  const toggleJoinInclude = useCallback((id: string) => {
    setJoinExcludedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const updateTrack = useCallback((id: string, updates: Partial<TrackData>) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )
  }, [])

  const deleteTrack = useCallback((id: string) => {
    pushUndo(tracks)
    setTracks((prev) => prev.filter((t) => t.id !== id))
    setJoinExcludedIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setTrackHeights((h) => {
      const next = { ...h }
      delete next[id]
      return next
    })
    if (selectedTrackId === id) setSelectedTrackId(null)
    playersRef.current.delete(id)
  }, [selectedTrackId, tracks, pushUndo])

  const moveTrack = useCallback((id: string, direction: 'up' | 'down') => {
    const idx = tracks.findIndex((t) => t.id === id)
    if (idx < 0) return
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= tracks.length) return
    pushUndo(tracks)
    const next = [...tracks]
    ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
    setTracks(next)
  }, [tracks, pushUndo])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const mod = isMac ? e.metaKey : e.ctrlKey
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (isPlaying) pause()
          else if (tracks.length > 0) play()
          break
        case 'KeyZ':
          if (mod && !e.shiftKey) { e.preventDefault(); undo() }
          else if (mod && e.shiftKey) { e.preventDefault(); redo() }
          break
        case 'KeyS':
          if (mod) { e.preventDefault(); toast.info('Save coming soon') }
          break
        case 'Delete':
        case 'Backspace':
          if (selectedTrackId) { e.preventDefault(); deleteTrack(selectedTrackId) }
          break
        case 'KeyD':
          if (mod && selectedTrackId) {
            e.preventDefault()
            const track = tracks.find((t) => t.id === selectedTrackId)
            if (track) {
              pushUndo(tracks)
              const dup: TrackData = {
                ...track,
                id: nanoid(),
                name: `${track.name} (copy)`,
                waveform: new Float32Array(track.waveform),
              }
              setTracks((prev) => [...prev, dup])
              setSelectedTrackId(dup.id)
              toast.success('Track duplicated')
            }
          }
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, tracks, selectedTrackId, play, pause, undo, redo, deleteTrack, pushUndo])

  const splitAtPlayhead = useCallback(() => {
    if (!selectedTrackId) return
    const track = tracks.find((t) => t.id === selectedTrackId)
    if (!track?.buffer) return
    pushUndo(tracks)
    const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
    const splitSample = Math.floor(playheadTime * SAMPLE_RATE)
    if (splitSample <= 0 || splitSample >= track.buffer.length) return
    const left = sliceBuffer(ctx, track.buffer, 0, splitSample)
    const right = sliceBuffer(ctx, track.buffer, splitSample, track.buffer.length)
    const leftWaveform = getWaveformData(left, 400)
    const rightWaveform = getWaveformData(right, 400)
    const leftTrack: TrackData = {
      ...track,
      type: 'audio',
      id: nanoid(),
      name: `${track.name} (1)`,
      buffer: left,
      waveform: leftWaveform,
      duration: left.duration,
      effects: track.effects ?? defaultEffects(),
    }
    const rightTrack: TrackData = {
      ...track,
      type: 'audio',
      id: nanoid(),
      name: `${track.name} (2)`,
      buffer: right,
      waveform: rightWaveform,
      duration: right.duration,
      effects: track.effects ?? defaultEffects(),
    }
    setTracks((prev) => {
      const idx = prev.findIndex((t) => t.id === selectedTrackId)
      const next = [...prev]
      next.splice(idx, 1, leftTrack, rightTrack)
      return next
    })
    setSelectedTrackId(leftTrack.id)
    toast.success('Split at playhead')
  }, [selectedTrackId, tracks, playheadTime, pushUndo])

  const trackColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6']
  const mixerTracks: MixerTrack[] = tracks.map((t, i) => {
    const colorIndex = t.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % trackColors.length
    return {
      id: t.id,
      name: t.name,
      volume: t.volume,
      pan: t.pan ?? 0,
      muted: t.muted,
      solo: t.solo,
      color: trackColors[colorIndex],
      peakLevel: isPlaying && selectedTrackId === t.id ? t.volume : 0,
      rmsLevel: isPlaying && selectedTrackId === t.id ? t.volume * 0.8 : 0,
      eqEnabled: t.effects?.eq?.enabled ?? false,
      eqFreq: t.effects?.eq?.freq ?? 1000,
      eqGain: t.effects?.eq?.gain ?? 0,
      reverbEnabled: t.effects?.reverb?.enabled ?? false,
      reverbDecay: t.effects?.reverb?.decay ?? 2,
      reverbMix: t.effects?.reverb?.mix ?? 0.3,
      delayEnabled: t.effects?.delay?.enabled ?? false,
      delayTime: t.effects?.delay?.time ?? 0.25,
      delayFeedback: t.effects?.delay?.feedback ?? 0.5,
    }
  })

  return (
    <DAWLayout>
      <div
        className="flex flex-col h-[calc(100vh-14rem)] overflow-hidden"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <TransportBar
        isPlaying={isPlaying}
        isRecording={isRecording}
        bpm={bpm}
        time={time}
        onPlay={play}
        onPause={pause}
        onStop={stop}
        onRecord={record}
        onExport={exportWav}
        onExportStems={exportStems}
        onExportJoined={exportJoinedWav}
        onBpmChange={setBpm}
        canExport={tracks.length > 0}
        canExportJoined={canExportJoined}
        loopEnabled={loopEnabled}
        onLoopToggle={() => setLoopEnabled((v) => !v)}
        punchInEnabled={punchInEnabled}
        onPunchInToggle={() => setPunchInEnabled((v) => !v)}
        punchInTime={punchInTime}
        punchOutTime={punchOutTime}
        onPunchInTimeChange={setPunchInTime}
        onPunchOutTimeChange={setPunchOutTime}
        onUndo={undo}
        onRedo={redo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        snapToGrid={snapToGrid}
        onSnapToggle={() => setSnapToGrid((v) => !v)}
        pixelsPerSecond={pixelsPerSecond}
        onZoomIn={() => setPixelsPerSecond((p) => Math.min(MAX_PIXELS_PER_SECOND, p + 20))}
        onZoomOut={() => setPixelsPerSecond((p) => Math.max(MIN_PIXELS_PER_SECOND, p - 20))}
      />

      <div className="flex flex-1 min-h-0 flex-col">
        <div ref={timelineScrollRef} className="flex-1 overflow-auto overflow-x-auto">
          {tracks.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-64 gap-4 cursor-pointer border-2 border-dashed rounded-xl m-6 transition-all duration-200 border-[rgb(var(--daw-border-strong))] text-[rgb(var(--daw-text-muted))] hover:border-[rgb(var(--daw-accent)/0.5)] hover:bg-[rgb(var(--daw-bg-panel)/0.5)]"
              onClick={() => document.getElementById('daw-file-input')?.click()}
            >
              <Upload className="h-14 w-14 text-[rgb(var(--daw-text-muted))]" />
              <p className="text-sm font-medium text-[rgb(var(--daw-text-secondary))]">Drop audio files here or click to upload</p>
              <p className="text-xs">Supports WAV, MP3, OGG, WebM</p>
              <input
                id="daw-file-input"
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <>
              <div className="daw-panel sticky top-0 z-10 flex shrink-0 items-stretch border-b border-[rgb(var(--daw-border))] bg-[rgb(var(--daw-bg-panel)/0.9)]">
                <div className="w-8 shrink-0 flex items-center justify-center border-r border-[rgb(var(--daw-border))] bg-[rgb(var(--daw-bg)/0.5)]">
                  <span className="text-[9px] text-[rgb(var(--daw-text-muted))]">↕</span>
                </div>
                <div className="w-1.5 shrink-0" />
                <div className="w-8 shrink-0 flex items-center justify-center border-r border-[rgb(var(--daw-border))] bg-[rgb(var(--daw-bg)/0.5)]">
                  <span
                    className="text-[9px] text-[rgb(var(--daw-text-muted))] text-center leading-tight px-0.5"
                    title="Checked tracks are appended in list order in Export joined. Uncheck to skip a track."
                  >
                    Join
                  </span>
                </div>
                <div className="w-44 shrink-0 flex items-center border-r border-[rgb(var(--daw-border))] px-2">
                  <span className="text-xs font-medium text-[rgb(var(--daw-text-muted))] uppercase tracking-wider">Track</span>
                </div>
                <div className="flex-1 min-w-0 relative overflow-x-auto" style={{ minWidth: Math.max(maxDuration * pixelsPerSecond, 400) }}>
                  <TimelineRuler
                    duration={maxDuration}
                    bpm={bpm}
                    pixelsPerSecond={pixelsPerSecond}
                    playheadProgress={playheadProgress}
                  />
                </div>
              </div>
              {tracks.map((track, idx) => (
                <TrackStrip
                  key={track.id}
                  track={{
                    ...track,
                    type: (track as TrackData & { type?: string }).type ?? 'audio',
                    pan: track.pan ?? 0,
                    armed: track.armed ?? false,
                    effects: track.effects ?? defaultEffects(),
                  }}
                  isSelected={selectedTrackId === track.id}
                  playheadProgress={playheadProgress}
                  onSelect={() => setSelectedTrackId(track.id)}
                  onVolumeChange={(vol) => updateTrack(track.id, { volume: vol })}
                  onPanChange={(pan) => updateTrack(track.id, { pan })}
                  onMuteToggle={() => updateTrack(track.id, { muted: !track.muted })}
                  onSoloToggle={() => updateTrack(track.id, { solo: !track.solo })}
                  onArmToggle={() => updateTrack(track.id, { armed: !(track.armed ?? false) })}
                  onDelete={() => deleteTrack(track.id)}
                  onSplit={((track as TrackData & { type?: string }).type ?? 'audio') === 'audio' ? splitAtPlayhead : undefined}
                  onReorder={(dir) => moveTrack(track.id, dir)}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < tracks.length - 1}
                  trackHeight={trackHeights[track.id] ?? defaultTrackHeight}
                  onHeightChange={(h) => setTrackHeights((prev) => ({ ...prev, [track.id]: h }))}
                  peakLevel={isPlaying && selectedTrackId === track.id ? track.volume : 0}
                  rmsLevel={isPlaying && selectedTrackId === track.id ? track.volume * 0.8 : 0}
                  arrangementDuration={maxDuration}
                  arrangementBpm={bpm}
                  pixelsPerSecond={pixelsPerSecond}
                  snapToGrid={snapToGrid}
                  onMidiNotesChange={
                    ((track as TrackData & { type?: string }).type ?? 'audio') === 'midi'
                      ? (notes) => updateTrack(track.id, { midiNotes: notes })
                      : undefined
                  }
                  showJoinExport={((track as TrackData & { type?: string }).type ?? 'audio') === 'audio' && !!track.buffer}
                  joinIncludeInExport={!joinExcludedIds.has(track.id)}
                  onJoinIncludeToggle={() => toggleJoinInclude(track.id)}
                />
              ))}
              <div className="p-4 flex gap-2">
                <label className="daw-button inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--daw-border-strong))] bg-[rgb(var(--daw-bg-active))] px-4 py-2 text-sm text-[rgb(var(--daw-text))] hover:bg-[rgb(var(--daw-bg-hover))] cursor-pointer transition-colors">
                  <Upload className="h-4 w-4" />
                  Add audio track
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <button
                  onClick={() => {
                    pushUndo(tracks)
                    const midiTrack: TrackData = {
                      id: nanoid(),
                      name: `MIDI ${tracks.length + 1}`,
                      type: 'midi',
                      buffer: null,
                      waveform: new Float32Array(0),
                      volume: 1,
                      pan: 0,
                      muted: false,
                      solo: false,
                      armed: false,
                      duration: 4,
                      midiNotes: [],
                      effects: defaultEffects(),
                    }
                    setTracks((prev) => [...prev, midiTrack])
                    setSelectedTrackId(midiTrack.id)
                  }}
                  className="daw-button inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--daw-border-strong))] bg-[rgb(var(--daw-bg-active))] px-4 py-2 text-sm text-[rgb(var(--daw-text))] hover:bg-[rgb(var(--daw-bg-hover))] transition-colors"
                >
                  Add MIDI track
                </button>
              </div>
            </>
          )}
        </div>

        {tracks.length > 0 && (
          <TimelineMinimap
            duration={maxDuration}
            pixelsPerSecond={pixelsPerSecond}
            viewportWidth={timelineViewportWidth}
            scrollLeft={timelineScrollLeft}
            playheadProgress={playheadProgress}
            trackCount={tracks.length}
            onSeek={(progress) => {
              const el = timelineScrollRef.current
              if (el) {
                const totalWidth = Math.max(maxDuration * pixelsPerSecond, 800)
                el.scrollLeft = progress * (totalWidth - el.clientWidth)
              }
            }}
          />
        )}

        <MixerPanel
          tracks={mixerTracks}
          selectedTrackId={selectedTrackId}
          onSelectTrack={setSelectedTrackId}
          onVolumeChange={(id, vol) => updateTrack(id, { volume: vol })}
          onPanChange={(id, pan) => updateTrack(id, { pan })}
          onMuteToggle={(id) => {
            const t = tracks.find((x) => x.id === id)
            if (t) updateTrack(id, { muted: !t.muted })
          }}
          onSoloToggle={(id) => {
            const t = tracks.find((x) => x.id === id)
            if (t) updateTrack(id, { solo: !t.solo })
          }}
          onEqChange={(id, enabled, freq, gain) => {
            const t = tracks.find((x) => x.id === id)
            if (!t) return
            updateTrack(id, {
              effects: {
                ...t.effects,
                eq: { enabled, freq: freq ?? t.effects?.eq?.freq ?? 1000, gain: gain ?? t.effects?.eq?.gain ?? 0 },
              },
            })
          }}
          onReverbChange={(id, enabled, decay, mix) => {
            const t = tracks.find((x) => x.id === id)
            if (!t) return
            updateTrack(id, {
              effects: {
                ...t.effects,
                reverb: { enabled, decay: decay ?? t.effects?.reverb?.decay ?? 2, mix: mix ?? t.effects?.reverb?.mix ?? 0.3 },
              },
            })
          }}
          onDelayChange={(id, enabled, time, feedback) => {
            const t = tracks.find((x) => x.id === id)
            if (!t) return
            updateTrack(id, {
              effects: {
                ...t.effects,
                delay: { enabled, time: time ?? t.effects?.delay?.time ?? 0.25, feedback: feedback ?? t.effects?.delay?.feedback ?? 0.5 },
              },
            })
          }}
          isOpen={mixerOpen}
          onToggle={() => setMixerOpen((v) => !v)}
        />
      </div>
      </div>
    </DAWLayout>
  )
}

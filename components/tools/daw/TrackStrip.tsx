'use client'

import { Volume2, VolumeX, Headphones, Trash2, Scissors, Mic, GripVertical, Music2, Piano, ChevronUp, ChevronDown } from 'lucide-react'
import { useState, useCallback } from 'react'
import { WaveformCanvas } from './WaveformCanvas'
import { PianoRoll } from './PianoRoll'
import { ArrangementGrid } from './ArrangementGrid'
import { AudioClip } from './AudioClip'
import { ClipContextMenu } from './ClipContextMenu'

import type { MidiNote } from '@/lib/daw/types'

export type { MidiNote }

export interface TrackData {
  id: string
  name: string
  type: 'audio' | 'midi'
  buffer: AudioBuffer | null
  waveform: Float32Array
  volume: number
  pan: number
  muted: boolean
  solo: boolean
  armed?: boolean
  duration: number
  midiNotes?: MidiNote[]
  effects: {
    eq: { enabled: boolean; freq: number; gain: number }
    reverb: { enabled: boolean; decay: number; mix: number }
    delay: { enabled: boolean; time: number; feedback: number }
  }
}

interface TrackStripProps {
  track: TrackData
  isSelected: boolean
  playheadProgress: number
  arrangementDuration?: number
  arrangementBpm?: number
  pixelsPerSecond?: number
  snapToGrid?: boolean
  onSelect: () => void
  onVolumeChange: (vol: number) => void
  onPanChange: (pan: number) => void
  onMuteToggle: () => void
  onSoloToggle: () => void
  onDelete: () => void
  onSplit?: () => void
  onMidiNotesChange?: (notes: MidiNote[]) => void
  onArmToggle?: () => void
  onReorder?: (direction: 'up' | 'down') => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  trackHeight?: number
  onHeightChange?: (height: number) => void
  peakLevel?: number
  rmsLevel?: number
}

export function TrackStrip({
  track,
  isSelected,
  playheadProgress,
  onSelect,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onDelete,
  onSplit,
  onMidiNotesChange,
  onArmToggle,
  onReorder,
  canMoveUp = false,
  canMoveDown = false,
  trackHeight = 80,
  onHeightChange,
  peakLevel = 0,
  rmsLevel = 0,
  arrangementDuration = 4,
  arrangementBpm = 120,
  pixelsPerSecond = 80,
  snapToGrid = true,
}: TrackStripProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const trackColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6']
  const colorIndex = track.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % trackColors.length
  const trackColor = trackColors[colorIndex]

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const startY = e.clientY
    const startH = trackHeight
    const onMouseMove = (ev: MouseEvent) => {
      const dy = ev.clientY - startY
      const newH = Math.max(48, Math.min(200, startH + dy))
      onHeightChange?.(newH)
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      className={`group flex shrink-0 items-stretch border-b border-[rgb(var(--daw-border))] transition-colors relative ${
        isSelected ? 'bg-[rgb(var(--daw-bg-hover)/0.5)]' : 'hover:bg-[rgb(var(--daw-bg)/0.8)]'
      }`}
      style={{ height: trackHeight }}
      onClick={onSelect}
    >
      {/* Reorder controls */}
      <div className="w-8 shrink-0 flex flex-col items-center justify-center gap-0.5 border-r border-[rgb(var(--daw-border))] bg-[rgb(var(--daw-bg)/0.5)]">
        {onReorder && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); canMoveUp && onReorder('up') }}
              disabled={!canMoveUp}
              className="daw-button p-0.5 rounded text-[rgb(var(--daw-text-muted))] hover:text-[rgb(var(--daw-text))] hover:bg-[rgb(var(--daw-bg-hover))] disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move track up"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <GripVertical className="h-3 w-3 text-[rgb(var(--daw-text-muted))]" />
            <button
              onClick={(e) => { e.stopPropagation(); canMoveDown && onReorder('down') }}
              disabled={!canMoveDown}
              className="daw-button p-0.5 rounded text-[rgb(var(--daw-text-muted))] hover:text-[rgb(var(--daw-text))] hover:bg-[rgb(var(--daw-bg-hover))] disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move track down"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
      <div className="w-1.5 shrink-0 rounded-r-sm" style={{ backgroundColor: trackColor, minWidth: 6 }} />
      <div className="w-44 shrink-0 flex flex-col border-r border-[rgb(var(--daw-border))] bg-[rgb(var(--daw-bg-panel)/0.5)] p-2.5">
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {(track as TrackData & { type?: string }).type === 'midi' ? (
              <Piano className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--daw-text-muted))]" />
            ) : (
              <Music2 className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--daw-text-muted))]" />
            )}
            <span className="text-sm font-medium text-[rgb(var(--daw-text))] truncate" title={track.name}>
              {track.name}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[rgb(var(--daw-record)/0.2)] text-[rgb(var(--daw-text-muted))] hover:text-[rgb(var(--daw-record))] transition-opacity"
            title="Delete track"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1 mb-2">
          <button
            onClick={(e) => { e.stopPropagation(); onMuteToggle() }}
            className={`daw-button flex h-7 w-7 items-center justify-center rounded ${track.muted ? 'bg-[rgb(var(--daw-accent)/0.3)] text-[rgb(var(--daw-accent))]' : 'bg-[rgb(var(--daw-bg-active))] text-[rgb(var(--daw-text-muted))] hover:bg-[rgb(var(--daw-bg-hover))] hover:text-[rgb(var(--daw-text-secondary))]'}`}
            title="Mute"
          >
            {track.muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSoloToggle() }}
            className={`daw-button flex h-7 w-7 items-center justify-center rounded ${track.solo ? 'bg-[rgb(var(--daw-accent)/0.3)] text-[rgb(var(--daw-accent))]' : 'bg-[rgb(var(--daw-bg-active))] text-[rgb(var(--daw-text-muted))] hover:bg-[rgb(var(--daw-bg-hover))] hover:text-[rgb(var(--daw-text-secondary))]'}`}
            title="Solo"
          >
            <Headphones className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[rgb(var(--daw-text-muted))] w-6">Vol</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={track.volume}
              onChange={(e) => { e.stopPropagation(); onVolumeChange(Number(e.target.value)) }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 h-1.5 accent-amber-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-500 w-6">Pan</span>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={track.pan}
              onChange={(e) => { e.stopPropagation(); onPanChange(Number(e.target.value)) }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 h-1.5 accent-amber-500"
            />
          </div>
        </div>
        {/* Peak/RMS meter */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex-1 h-1.5 rounded-full bg-[rgb(var(--daw-bg))] overflow-hidden">
            <div
              className="h-full rounded-full bg-[rgb(var(--daw-play))] transition-all duration-75"
              style={{ width: `${Math.min(100, (rmsLevel || 0) * 100)}%` }}
            />
          </div>
          <span className="text-[9px] font-mono text-[rgb(var(--daw-text-muted))] w-8">
            {Math.round((peakLevel || 0) * 100)}%
          </span>
        </div>
        {onSplit && track.buffer && (
          <button
            onClick={(e) => { e.stopPropagation(); onSplit() }}
            className="daw-button mt-2 flex h-6 w-6 items-center justify-center rounded bg-[rgb(var(--daw-bg-active))] text-[rgb(var(--daw-text-muted))] hover:bg-[rgb(var(--daw-bg-hover))] hover:text-[rgb(var(--daw-text-secondary))] transition-colors"
            title="Split at playhead"
          >
            <Scissors className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex-1 min-w-0 relative overflow-hidden cursor-pointer bg-[rgb(var(--daw-bg))]" style={{ minWidth: Math.max(arrangementDuration * pixelsPerSecond, 400) }}>
        {((track as TrackData & { type?: string }).type ?? 'audio') === 'audio' && (
          <ArrangementGrid
            duration={arrangementDuration}
            bpm={arrangementBpm}
            pixelsPerSecond={pixelsPerSecond}
            height={trackHeight - 4}
          />
        )}
        {((track as TrackData & { type?: string }).type ?? 'audio') === 'midi' ? (
          <PianoRoll
            notes={track.midiNotes ?? []}
            onChange={(notes) => onMidiNotesChange?.(notes)}
            duration={track.duration || 4}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        ) : track.waveform.length > 0 ? (
          <WaveformCanvas
            waveform={track.waveform}
            width={1200}
            height={trackHeight - 4}
            color={trackColor ? `${trackColor}cc` : undefined}
            progress={playheadProgress}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[rgb(var(--daw-text-muted))] text-sm border border-dashed border-[rgb(var(--daw-border-strong))] rounded m-2">
            Drop audio or record
          </div>
        )}
      </div>
      {/* Track height resize handle */}
      {onHeightChange && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-[rgb(var(--daw-accent)/0.3)] transition-colors flex items-center justify-center"
          onMouseDown={handleResizeStart}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-8 h-0.5 rounded-full bg-[rgb(var(--daw-border-strong))]" />
        </div>
      )}

      {contextMenu && (
        <ClipContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          actions={[
            { label: 'Split at playhead', onClick: () => onSplit?.(), disabled: !onSplit || !track.buffer },
            { label: 'Duplicate', onClick: () => {} },
            { label: 'Rename', onClick: () => {} },
            { label: 'Delete', onClick: onDelete },
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}

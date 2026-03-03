'use client'

import { useState } from 'react'
import { VolumeX, Headphones, ChevronDown, Sliders, ChevronRight } from 'lucide-react'
import { MixerFader } from './MixerFader'
import { PanKnob } from './PanKnob'

export interface MixerTrack {
  id: string
  name: string
  volume: number
  pan: number
  muted: boolean
  solo: boolean
  eqEnabled: boolean
  eqFreq: number
  eqGain: number
  reverbEnabled: boolean
  reverbDecay: number
  reverbMix: number
  delayEnabled: boolean
  delayTime: number
  delayFeedback: number
  color?: string
  peakLevel?: number
  rmsLevel?: number
}

interface MixerPanelProps {
  tracks: MixerTrack[]
  selectedTrackId: string | null
  onSelectTrack: (id: string) => void
  onVolumeChange: (id: string, vol: number) => void
  onPanChange: (id: string, pan: number) => void
  onMuteToggle: (id: string) => void
  onSoloToggle: (id: string) => void
  onEqChange: (id: string, enabled: boolean, freq?: number, gain?: number) => void
  onReverbChange: (id: string, enabled: boolean, decay?: number, mix?: number) => void
  onDelayChange: (id: string, enabled: boolean, time?: number, feedback?: number) => void
  isOpen: boolean
  onToggle: () => void
}

export function MixerPanel({
  tracks,
  selectedTrackId,
  onSelectTrack,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onEqChange,
  onReverbChange,
  onDelayChange,
  isOpen,
  onToggle,
}: MixerPanelProps) {
  if (!isOpen) {
    return (
      <div className="border-t border-[rgb(var(--daw-border))] bg-[rgb(var(--daw-bg-panel)/0.5)] px-4 py-2">
        <button
          onClick={onToggle}
          className="daw-button flex items-center gap-2 rounded-lg border border-[rgb(var(--daw-border-strong))] bg-[rgb(var(--daw-bg-active))] px-4 py-2 text-sm text-[rgb(var(--daw-text))] hover:bg-[rgb(var(--daw-bg-hover))] transition-colors"
        >
          <Sliders className="h-4 w-4" />
          Show Mixer
        </button>
      </div>
    )
  }

  return (
    <div className="border-t border-[rgb(var(--daw-border))] bg-[rgb(var(--daw-bg-panel)/0.8)]">
      <div className="flex items-center justify-between border-b border-[rgb(var(--daw-border))] px-2 py-2">
        <h3 className="text-sm font-semibold text-[rgb(var(--daw-text))]">Mixer</h3>
        <button
          onClick={onToggle}
          className="daw-button flex items-center gap-1 rounded px-2 py-1 text-xs text-[rgb(var(--daw-text-muted))] hover:text-[rgb(var(--daw-text-secondary))] hover:bg-[rgb(var(--daw-bg-active))] transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
          Hide
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto p-4">
        {tracks.map((track) => (
          <MixerStrip
            key={track.id}
            track={track}
            isSelected={selectedTrackId === track.id}
            onSelect={() => onSelectTrack(track.id)}
            onVolumeChange={(v) => onVolumeChange(track.id, v)}
            onPanChange={(p) => onPanChange(track.id, p)}
            onMuteToggle={() => onMuteToggle(track.id)}
            onSoloToggle={() => onSoloToggle(track.id)}
            onEqChange={(en, f, g) => onEqChange(track.id, en, f, g)}
            onReverbChange={(en, d, m) => onReverbChange(track.id, en, d, m)}
            onDelayChange={(en, t, f) => onDelayChange(track.id, en, t, f)}
          />
        ))}
      </div>
    </div>
  )
}

function MixerStrip({
  track,
  isSelected,
  onSelect,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onEqChange,
  onReverbChange,
  onDelayChange,
}: {
  track: MixerTrack
  isSelected: boolean
  onSelect: () => void
  onVolumeChange: (v: number) => void
  onPanChange: (p: number) => void
  onMuteToggle: () => void
  onSoloToggle: () => void
  onEqChange: (en: boolean, f?: number, g?: number) => void
  onReverbChange: (en: boolean, d?: number, m?: number) => void
  onDelayChange: (en: boolean, t?: number, f?: number) => void
}) {
  const [effectsOpen, setEffectsOpen] = useState(false)

  return (
    <div
      className={`flex w-24 shrink-0 flex-col items-center gap-3 rounded-xl border p-4 transition-colors ${
        isSelected ? 'border-[rgb(var(--daw-accent)/0.5)] bg-[rgb(var(--daw-bg-hover)/0.8)]' : 'border-[rgb(var(--daw-border-strong)/0.8)] bg-[rgb(var(--daw-bg-active)/0.5)] hover:bg-[rgb(var(--daw-bg-active)/0.7)]'
      }`}
      onClick={onSelect}
    >
      {/* Track color + name */}
      <div className="flex items-center gap-2 w-full">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: track.color || '#6366f1' }} />
        <span className="flex-1 truncate text-center text-xs font-medium text-[rgb(var(--daw-text))]" title={track.name}>
          {track.name}
        </span>
      </div>
      <div className="flex gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onMuteToggle() }}
          className={`daw-button flex h-7 w-7 items-center justify-center rounded ${track.muted ? 'bg-[rgb(var(--daw-accent)/0.3)] text-[rgb(var(--daw-accent))]' : 'bg-[rgb(var(--daw-bg-hover)/0.8)] text-[rgb(var(--daw-text-muted))] hover:text-[rgb(var(--daw-text-secondary))]'}`}
          title="Mute"
        >
          <VolumeX className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onSoloToggle() }}
          className={`daw-button flex h-7 w-7 items-center justify-center rounded ${track.solo ? 'bg-[rgb(var(--daw-accent)/0.3)] text-[rgb(var(--daw-accent))]' : 'bg-[rgb(var(--daw-bg-hover)/0.8)] text-[rgb(var(--daw-text-muted))] hover:text-[rgb(var(--daw-text-secondary))]'}`}
          title="Solo"
        >
          <Headphones className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex items-end gap-3">
        <MixerFader
          value={track.volume}
          onChange={onVolumeChange}
          peak={track.peakLevel}
          rms={track.rmsLevel}
        />
        <PanKnob value={track.pan} onChange={onPanChange} size={32} />
      </div>
      {/* Collapsible effect rack */}
      <div className="w-full border-t border-[rgb(var(--daw-border-strong))] pt-2 mt-1">
        <button
          onClick={(e) => { e.stopPropagation(); setEffectsOpen((o) => !o) }}
          className="daw-button flex w-full items-center gap-1 rounded px-2 py-1 text-[10px] text-[rgb(var(--daw-text-muted))] hover:text-[rgb(var(--daw-text-secondary))] hover:bg-[rgb(var(--daw-bg-hover))]"
        >
          <ChevronRight className={`h-3 w-3 transition-transform ${effectsOpen ? 'rotate-90' : ''}`} />
          Effects
        </button>
        {effectsOpen && (
          <div className="mt-2 space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] text-[rgb(var(--daw-text-secondary))] cursor-pointer">
              <input
                type="checkbox"
                checked={track.eqEnabled}
                onChange={(e) => { e.stopPropagation(); onEqChange(e.target.checked) }}
                onClick={(e) => e.stopPropagation()}
                className="rounded border-[rgb(var(--daw-border-strong))] bg-[rgb(var(--daw-bg-hover))] accent-[rgb(var(--daw-accent))]"
              />
              EQ
            </label>
            {track.eqEnabled && (
              <div className="space-y-1">
                <input
                  type="range"
                  min={100}
                  max={8000}
                  value={track.eqFreq}
                  onChange={(e) => onEqChange(true, Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="h-1 w-full accent-[rgb(var(--daw-accent))]"
                />
                <input
                  type="range"
                  min={-12}
                  max={12}
                  value={track.eqGain}
                  onChange={(e) => onEqChange(true, track.eqFreq, Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="h-1 w-full accent-[rgb(var(--daw-accent))]"
                />
              </div>
            )}
            <label className="flex items-center gap-1.5 text-[10px] text-[rgb(var(--daw-text-secondary))] cursor-pointer">
              <input
                type="checkbox"
                checked={track.reverbEnabled}
                onChange={(e) => { e.stopPropagation(); onReverbChange(e.target.checked) }}
                onClick={(e) => e.stopPropagation()}
                className="rounded border-[rgb(var(--daw-border-strong))] bg-[rgb(var(--daw-bg-hover))] accent-[rgb(var(--daw-accent))]"
              />
              Reverb
            </label>
            {track.reverbEnabled && (
              <div className="space-y-1">
                <input
                  type="range"
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={track.reverbDecay}
                  onChange={(e) => onReverbChange(true, Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="h-1 w-full accent-[rgb(var(--daw-accent))]"
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={track.reverbMix}
                  onChange={(e) => onReverbChange(true, track.reverbDecay, Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="h-1 w-full accent-[rgb(var(--daw-accent))]"
                />
              </div>
            )}
            <label className="flex items-center gap-1.5 text-[10px] text-[rgb(var(--daw-text-secondary))] cursor-pointer">
              <input
                type="checkbox"
                checked={track.delayEnabled}
                onChange={(e) => { e.stopPropagation(); onDelayChange(e.target.checked) }}
                onClick={(e) => e.stopPropagation()}
                className="rounded border-[rgb(var(--daw-border-strong))] bg-[rgb(var(--daw-bg-hover))] accent-[rgb(var(--daw-accent))]"
              />
              Delay
            </label>
            {track.delayEnabled && (
              <div className="space-y-1">
                <input
                  type="range"
                  min={0.1}
                  max={2}
                  step={0.01}
                  value={track.delayTime}
                  onChange={(e) => onDelayChange(true, Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="h-1 w-full accent-[rgb(var(--daw-accent))]"
                />
                <input
                  type="range"
                  min={0}
                  max={0.9}
                  step={0.01}
                  value={track.delayFeedback}
                  onChange={(e) => onDelayChange(true, track.delayTime, Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="h-1 w-full accent-[rgb(var(--daw-accent))]"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

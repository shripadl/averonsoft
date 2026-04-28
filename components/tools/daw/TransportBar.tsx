'use client'

import { Play, Pause, Square, Mic, Download, Undo2, Redo2, Repeat, ZoomIn, ZoomOut, Magnet, Link2 } from 'lucide-react'

interface TransportBarProps {
  isPlaying: boolean
  isRecording: boolean
  bpm: number
  time: string
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onRecord: () => void
  onExport: () => void
  onExportStems: () => void
  onExportJoined: () => void
  onBpmChange: (bpm: number) => void
  canExport: boolean
  canExportJoined: boolean
  loopEnabled: boolean
  onLoopToggle: () => void
  punchInEnabled: boolean
  onPunchInToggle: () => void
  punchInTime: number
  punchOutTime: number
  onPunchInTimeChange: (t: number) => void
  onPunchOutTimeChange: (t: number) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  snapToGrid: boolean
  onSnapToggle: () => void
  pixelsPerSecond: number
  onZoomIn: () => void
  onZoomOut: () => void
}

export function TransportBar({
  isPlaying,
  isRecording,
  bpm,
  time,
  onPlay,
  onPause,
  onStop,
  onRecord,
  onExport,
  onExportStems,
  onExportJoined,
  onBpmChange,
  canExport,
  canExportJoined,
  loopEnabled,
  onLoopToggle,
  punchInEnabled,
  onPunchInToggle,
  punchInTime,
  punchOutTime,
  onPunchInTimeChange,
  onPunchOutTimeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  snapToGrid,
  onSnapToggle,
  pixelsPerSecond,
  onZoomIn,
  onZoomOut,
}: TransportBarProps) {
  return (
    <div className="daw-panel flex flex-wrap items-center gap-6 border-b border-[rgb(var(--daw-border))] px-6 py-4">
      {/* Transport */}
      <div className="flex items-center gap-1 rounded-xl bg-[rgb(var(--daw-bg-active)/0.9)] p-1.5 shadow-inner">
        <button
          onClick={onPlay}
          disabled={isPlaying}
          className="daw-button flex h-9 w-9 items-center justify-center rounded-md bg-[rgb(var(--daw-play))] text-white hover:bg-[rgb(var(--daw-play-hover))] disabled:opacity-50 disabled:hover:bg-[rgb(var(--daw-play))] transition-colors"
          title="Play"
        >
          <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
        </button>
        <button
          onClick={onPause}
          disabled={!isPlaying}
          className="daw-button flex h-9 w-9 items-center justify-center rounded-md text-[rgb(var(--daw-text-secondary))] hover:bg-[rgb(var(--daw-bg-hover))] hover:text-white disabled:opacity-40 transition-colors"
          title="Pause"
        >
          <Pause className="h-4 w-4" fill="currentColor" />
        </button>
        <button
          onClick={onStop}
          className="daw-button flex h-9 w-9 items-center justify-center rounded-md text-[rgb(var(--daw-text-secondary))] hover:bg-[rgb(var(--daw-bg-hover))] hover:text-white transition-colors"
          title="Stop"
        >
          <Square className="h-3.5 w-3.5" fill="currentColor" />
        </button>
      </div>

      <div className="h-6 w-px bg-zinc-700" />

      {/* Record */}
      <button
        onClick={onRecord}
        className={`daw-button flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
          isRecording ? 'bg-[rgb(var(--daw-record))] text-white' : 'bg-[rgb(var(--daw-bg-active))] text-[rgb(var(--daw-text-secondary))] hover:bg-[rgb(var(--daw-bg-hover))] hover:text-white'
        }`}
        title="Record"
      >
        <Mic className="h-4 w-4" />
      </button>

      {/* Loop */}
      <button
        onClick={onLoopToggle}
        className={`daw-button flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
          loopEnabled ? 'bg-[rgb(var(--daw-accent)/0.8)] text-white' : 'bg-[rgb(var(--daw-bg-active))] text-[rgb(var(--daw-text-secondary))] hover:bg-[rgb(var(--daw-bg-hover))] hover:text-white'
        }`}
        title="Loop"
      >
        <Repeat className="h-4 w-4" />
      </button>

      {/* Punch In/Out */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={punchInEnabled}
            onChange={onPunchInToggle}
            className="rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500/50"
          />
          <span className="text-xs text-[rgb(var(--daw-text-muted))]">Punch</span>
        </label>
        <input
          type="number"
          min={0}
          step={0.1}
          value={punchInTime.toFixed(1)}
          onChange={(e) => onPunchInTimeChange(Number(e.target.value) || 0)}
          className="w-14 rounded-md border border-[rgb(var(--daw-border-strong))] bg-[rgb(var(--daw-bg-active))] px-2 py-1 text-xs text-[rgb(var(--daw-text))] focus:border-[rgb(var(--daw-accent)/0.5)] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--daw-accent)/0.3)] transition-colors"
        />
        <input
          type="number"
          min={0}
          step={0.1}
          value={punchOutTime.toFixed(1)}
          onChange={(e) => onPunchOutTimeChange(Number(e.target.value) || 0)}
          className="w-14 rounded-md border border-[rgb(var(--daw-border-strong))] bg-[rgb(var(--daw-bg-active))] px-2 py-1 text-xs text-[rgb(var(--daw-text))] focus:border-[rgb(var(--daw-accent)/0.5)] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--daw-accent)/0.3)] transition-colors"
        />
      </div>

      <div className="h-6 w-px bg-[rgb(var(--daw-border-strong))]" />

      {/* Snap to grid */}
      <button
        onClick={onSnapToggle}
        className={`daw-button flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
          snapToGrid ? 'bg-[rgb(var(--daw-accent)/0.8)] text-white' : 'bg-[rgb(var(--daw-bg-active))] text-[rgb(var(--daw-text-secondary))] hover:bg-[rgb(var(--daw-bg-hover))] hover:text-white'
        }`}
        title={snapToGrid ? 'Snap to grid (on)' : 'Snap to grid (off)'}
      >
        <Magnet className="h-4 w-4" />
      </button>

      {/* Zoom */}
      <div className="flex items-center gap-0.5 rounded-lg bg-[rgb(var(--daw-bg-active))] p-0.5">
        <button
          onClick={onZoomOut}
          className="daw-button flex h-8 w-8 items-center justify-center rounded text-[rgb(var(--daw-text-secondary))] hover:bg-[rgb(var(--daw-bg-hover))] hover:text-white transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="min-w-[3rem] text-center text-xs font-mono text-[rgb(var(--daw-text-muted))]">{Math.round(pixelsPerSecond)}px/s</span>
        <button
          onClick={onZoomIn}
          className="daw-button flex h-8 w-8 items-center justify-center rounded text-[rgb(var(--daw-text-secondary))] hover:bg-[rgb(var(--daw-bg-hover))] hover:text-white transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      <div className="h-6 w-px bg-[rgb(var(--daw-border-strong))]" />

      {/* Undo/Redo */}
      <div className="flex gap-0.5">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="daw-button flex h-8 w-8 items-center justify-center rounded text-[rgb(var(--daw-text-secondary))] hover:bg-[rgb(var(--daw-bg-hover))] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[rgb(var(--daw-text-secondary))] transition-colors"
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="daw-button flex h-8 w-8 items-center justify-center rounded text-[rgb(var(--daw-text-secondary))] hover:bg-[rgb(var(--daw-bg-hover))] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[rgb(var(--daw-text-secondary))] transition-colors"
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      {/* BPM & Time */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">BPM</span>
          <input
            type="number"
            min={40}
            max={240}
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value) || 120)}
            className="w-14 rounded-md border border-[rgb(var(--daw-border-strong))] bg-[rgb(var(--daw-bg-active))] px-2 py-1 text-sm font-mono text-[rgb(var(--daw-text))] focus:border-[rgb(var(--daw-accent)/0.5)] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--daw-accent)/0.3)] transition-colors"
          />
        </div>
        <div className="min-w-[72px] font-mono text-sm text-[rgb(var(--daw-text-secondary))] tabular-nums">{time}</div>
      </div>

      <div className="flex-1" />

      {/* Export */}
      <div className="flex gap-2">
        <button
          onClick={onExport}
          disabled={!canExport}
          className="daw-button flex items-center gap-2 rounded-lg border border-[rgb(var(--daw-border-strong))] bg-[rgb(var(--daw-bg-active))] px-4 py-2 text-sm font-medium text-[rgb(var(--daw-text))] hover:bg-[rgb(var(--daw-bg-hover))] disabled:opacity-40 disabled:hover:bg-[rgb(var(--daw-bg-active))] transition-colors"
        >
          <Download className="h-4 w-4" />
          Export WAV
        </button>
        <button
          onClick={onExportStems}
          disabled={!canExport}
          className="daw-button flex items-center gap-2 rounded-lg border border-[rgb(var(--daw-border-strong))] bg-[rgb(var(--daw-bg-active))] px-4 py-2 text-sm font-medium text-[rgb(var(--daw-text))] hover:bg-[rgb(var(--daw-bg-hover))] disabled:opacity-40 disabled:hover:bg-[rgb(var(--daw-bg-active))] transition-colors"
        >
          <Download className="h-4 w-4" />
          Export Stems
        </button>
        <button
          type="button"
          onClick={onExportJoined}
          disabled={!canExportJoined}
          title="Concatenate audio tracks in list order (uncheck Join on a track to exclude). Export mix above still sums tracks."
          className="daw-button flex items-center gap-2 rounded-lg border border-[rgb(var(--daw-border-strong))] bg-[rgb(var(--daw-bg-active))] px-4 py-2 text-sm font-medium text-[rgb(var(--daw-text))] hover:bg-[rgb(var(--daw-bg-hover))] disabled:opacity-40 disabled:hover:bg-[rgb(var(--daw-bg-active))] transition-colors"
        >
          <Link2 className="h-4 w-4" />
          Export joined
        </button>
      </div>
    </div>
  )
}

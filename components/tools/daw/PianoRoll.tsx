'use client'

import { useState, useCallback } from 'react'
import type { MidiNote } from '@/lib/daw/types'

interface PianoRollProps {
  notes: MidiNote[]
  onChange: (notes: MidiNote[]) => void
  duration: number
  isSelected: boolean
  onSelect: () => void
}

const PITCHES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const OCTAVES = 4
const ROWS = OCTAVES * 12

function pitchToMidi(pitch: number): string {
  const octave = Math.floor(pitch / 12)
  const note = pitch % 12
  return `${PITCHES[note]}${octave}`
}

export function PianoRoll({
  notes,
  onChange,
  duration,
  isSelected,
  onSelect,
}: PianoRollProps) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [addingNote, setAddingNote] = useState<{ pitch: number; startTime: number } | null>(null)

  const handleGridClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()
      const rect = e.currentTarget.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1 - (e.clientY - rect.top) / rect.height
      const pitch = Math.floor(y * ROWS)
      const startTime = x * Math.max(duration, 4)
      const newNote: MidiNote = {
        id: `note-${Date.now()}`,
        pitch,
        startTime,
        duration: 0.25,
        velocity: 0.8,
      }
      onChange([...notes, newNote])
      setAddingNote({ pitch, startTime })
    },
    [notes, duration, onChange]
  )

  const handleMouseUp = useCallback(() => {
    setDragging(null)
    setAddingNote(null)
  }, [])

  const pixelsPerSecond = 100
  const rowHeight = 16

  return (
    <div
      className={`flex h-24 shrink-0 bg-zinc-950 ${
        isSelected ? 'ring-1 ring-amber-500/30' : ''
      }`}
      onClick={onSelect}
    >
      <div className="w-16 shrink-0 border-r border-zinc-800 flex flex-col text-[10px] text-zinc-500 bg-zinc-900/50">
        {Array.from({ length: Math.min(ROWS, 24) }).map((_, i) => (
          <div key={i} className="h-4 border-b border-zinc-800/50 px-1" style={{ minHeight: rowHeight }}>
            {pitchToMidi(ROWS - 1 - i)}
          </div>
        ))}
      </div>
      <div
        className="flex-1 relative overflow-hidden bg-zinc-950"
        style={{ minWidth: Math.max(duration * pixelsPerSecond, 400) }}
        onClick={handleGridClick}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="absolute inset-0 flex">
          {Array.from({ length: Math.ceil(duration) || 4 }).map((_, bar) => (
            <div
              key={bar}
              className="border-r border-zinc-800/60"
              style={{ width: pixelsPerSecond }}
            />
          ))}
        </div>
        {notes.map((note) => (
          <div
            key={note.id}
            className="absolute rounded bg-amber-500/90 hover:bg-amber-500 cursor-pointer shadow-sm"
            style={{
              left: `${(note.startTime / Math.max(duration, 4)) * 100}%`,
              top: `${((ROWS - 1 - note.pitch) / ROWS) * 100}%`,
              width: `${Math.max((note.duration / Math.max(duration, 4)) * 100, 2)}%`,
              height: `${100 / ROWS}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

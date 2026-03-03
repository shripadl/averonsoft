/**
 * DAW data types for non-destructive editing, clips, and project state
 */

export interface AudioClip {
  id: string
  /** Reference to source buffer (stored in project) */
  sourceId: string
  /** Start time in timeline (seconds) */
  startTime: number
  /** Offset into source buffer (seconds) */
  sourceOffset: number
  /** Duration of clip (seconds) */
  duration: number
  /** Gain 0-1 */
  gain: number
  /** Pitch shift in semitones */
  pitchShift: number
  /** Time stretch factor (1 = normal) */
  timeStretch: number
}

export interface AudioRegion {
  id: string
  clips: AudioClip[]
  /** Combined duration for display */
  duration: number
}

export interface TrackData {
  id: string
  name: string
  buffer: AudioBuffer | null
  waveform: Float32Array
  volume: number
  pan: number
  muted: boolean
  solo: boolean
  duration: number
  /** Non-destructive clips (empty = use full buffer) */
  clips: AudioClip[]
  /** Effect params */
  effects: {
    eq: { enabled: boolean; freq: number; gain: number }
    reverb: { enabled: boolean; decay: number; mix: number }
    delay: { enabled: boolean; time: number; feedback: number }
  }
}

export interface RecordingConfig {
  loopEnabled: boolean
  loopStart: number
  loopEnd: number
  punchInEnabled: boolean
  punchInTime: number
  punchOutTime: number
}

export interface UndoState {
  tracks: TrackData[]
}

export interface MidiNote {
  id: string
  pitch: number
  startTime: number
  duration: number
  velocity: number
}

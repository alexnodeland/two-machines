// The avoiding-mud lesson (grammar lesson 4, docs/chapters/04-the-grammar.md):
// deliberate failure, measured. The card's narrative is a phase machine driven
// by the same occupancy number the loop face reads — you are told you have
// made mud only when you actually have, and told it cleared only when it did.
// Mud is a boundary you learn by crossing in both directions, never a wrong
// answer (the chapter's must-not-imply).

export type MudPhase = 'filling' | 'made-mud' | 'cleared'

/** Crossing into mud uses the meter's own top stage; "cleared" waits for the
 * loop to thin all the way back to sparse, so the reader hears the journey
 * down, not just the knob move. */
export const MUD_AT = 0.85
export const CLEAR_AT = 0.34

export const nextMudPhase = (phase: MudPhase, occupancy: number): MudPhase => {
  if (phase === 'filling') return occupancy >= MUD_AT ? 'made-mud' : 'filling'
  if (phase === 'made-mud') return occupancy < CLEAR_AT ? 'cleared' : 'made-mud'
  return 'cleared'
}

export const mudLessonSay = (phase: MudPhase): string => {
  if (phase === 'filling') {
    return 'Fill it. Play fast, play thick — the aim is failure, on purpose. The meter will tell you when you have arrived.'
  }
  if (phase === 'made-mud') {
    return 'That is mud: everything is present all the time, so nothing is. Now pull the playback level down, thin your playing, and spread out of the middle octave.'
  }
  return 'It cleared — and you did that with one knob and restraint, not with more notes. The boundary runs in both directions, and now you have crossed it both ways.'
}

// Sound cues. A scene exports `sfx: Cue[]` built with these helpers; mix.ts
// collects them, adds a whoosh before every crossfaded scene and sets the gains.
export type CueKind = 'tick' | 'whoosh' | 'rise' | 'resolve';
export type Cue = {at: number; kind: CueKind};

/** Short UI tick for a number, tile or data point landing. Keep at most two within 12 frames. */
export const tick = (at: number): Cue => ({at, kind: 'tick'});
/** Rising bell cue for the one big assembly moment of the video. Use once or twice at most. */
export const rise = (at: number): Cue => ({at, kind: 'rise'});
/** The single clean resolve at the very end. */
export const resolve = (at: number): Cue => ({at, kind: 'resolve'});

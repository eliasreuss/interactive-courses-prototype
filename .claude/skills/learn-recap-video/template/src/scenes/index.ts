// Scene registry. The key is the `scene` name used in script.json. Section
// title cards (`card-<section>`) are added by Video.tsx and are not listed here.
// Each scene module exports `Scene`, `beats` (absolute frames for its visual
// events) and optionally `sfx` (sound cues, usually built from its beats).
import React from 'react';
import {Cue} from '../sfx';
import * as agenda from './Agenda';
import * as close from './Close';
import * as opening from './Opening';
import * as process from './Process';

export type SceneProps = {offset: number};
export type Beats = {[key: string]: number | number[] | Beats};
export type SceneModule = {Scene: React.FC<SceneProps>; beats: Beats; sfx?: Cue[]};

export const registry: Record<string, SceneModule> = {
  opening,
  agenda,
  // __SCENES__
  process,
  close,
};

// Every visual event, as an absolute frame tied to a spoken word. Scenes and
// the sound effect track both read from here, so ticks always land on the
// visual they belong to.
import {at, card, lineEnd, lineStart, scene} from './timeline';

// Visuals start a touch before the word so they have settled when it is heard.
const LEAD = 3;
const cue = (id: number, word: string, nth = 0) => at(id, word, nth) - LEAD;

export const beats = {
  opening: {
    hero: 4,
    title: 10,
  },
  agenda: {
    cards: cue(2, 'understand'),
  },
  cards: {
    s1: card('s1'),
    s2: card('s2'),
    s3: card('s3'),
    recap: card('recap'),
  },
  eightyTwenty: {
    cubes: lineStart(3),
    split: cue(3, 'few'),
    highlightFew: cue(4, 'twenty'),
    eighty: cue(4, 'eighty'),
    twenty: cue(4, 'profit') + 6,
  },
  kpiBenchmark: {
    portfolio: cue(5, 'deciding'),
    portfolioBars: cue(5, 'performs'),
    title: cue(6, 'kpi'),
    categories: cue(6, 'categories'),
    products: cue(6, 'individual'),
  },
  categorise: {
    question: cue(7, 'question'),
    cubes: lineStart(8),
    tiles: cue(9, 'categorize'),
  },
  axes: {
    revenue: cue(10, 'revenue'),
    margin: cue(10, 'margin'),
  },
  fourCategories: {
    descriptors: cue(11, 'place'),
    assemble: cue(11, 'four'),
    focus: {
      protect: lineStart(12),
      develop: lineStart(13),
      grow: lineStart(14),
      turnaround: lineStart(15),
    },
    goal: {
      protect: cue(12, 'keep'),
      develop: cue(13, 'improve'),
      grow: cue(14, 'find'),
      turnaround: cue(15, 'improve'),
    },
    release: lineEnd(15) + 8,
  },
  actions: {
    label: cue(16, 'label'),
    lists: cue(17, 'actions'),
  },
  insight: {
    title: lineStart(18),
    portfolio: cue(18, 'portfolio'),
    divided: cue(18, 'divided'),
    names: cue(18, 'four'),
  },
  picture: {
    revenue: cue(19, 'revenue'),
    margin: cue(19, 'margin'),
    missing: cue(19, 'part'),
    costs: cue(20, 'costs'),
  },
  costToServe: {
    title: scene('costToServe').from + 6,
    buy: cue(21, 'buy'),
    sell: cue(21, 'sell'),
    fifty: cue(22, 'fifty'),
    freight: cue(23, 'freight'),
    receiving: cue(23, 'receiving'),
    bonus: cue(23, 'bonus'),
    sending: cue(23, 'delivery'),
    thought: cue(24, 'fifty'),
    twenty: cue(24, 'twenty'),
  },
  costTable: {
    base: lineStart(25),
    direct: cue(26, 'direct'),
    goods: cue(26, 'goods'),
    freight: cue(26, 'freight'),
    discounts: cue(26, 'discounts'),
    indirect: lineStart(27),
    service: cue(27, 'service'),
    handling: cue(27, 'handling'),
    logistics: cue(27, 'logistics'),
    total: cue(27, 'money'),
    looked: cue(28, 'looked'),
    different: cue(28, 'different'),
  },
  process: {
    cards: cue(29, 'process'),
    steps: [lineStart(30), lineStart(31), lineStart(32)],
  },
  close: {
    title: scene('close').from + 4,
    verbs: [cue(33, 'protect'), cue(33, 'improve'), cue(33, 'grow'), cue(33, 'reconsider')],
    resolve: lineEnd(33) - 6,
  },
};

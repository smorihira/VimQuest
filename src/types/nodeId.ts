/** Semantic node identifiers for the skill tree. */
export const NodeId = {
  Motion: 'motion',
  Edit: 'edit',
  Mode: 'mode',
  Search: 'search',
  Operator: 'operator',
  TextObj: 'textobj',
  Linewise: 'linewise',
  Visual: 'visual',
  VisualAdv: 'visual-adv',
  Register: 'register',
  Shortcut: 'shortcut',
  StructJump: 'struct-jump',
  MotionAdv: 'motion-adv',
  OperatorAdv: 'operator-adv',
  Number: 'number',
  ScrollMark: 'scroll-mark',
  Screen: 'screen',
} as const

export type NodeId = (typeof NodeId)[keyof typeof NodeId]

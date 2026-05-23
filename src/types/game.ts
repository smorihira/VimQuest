import type { StageResult } from './stage'

/** Tutorial completion state */
export type TutorialStatus = 'completed' | 'skipped'

/** Persisted game progress (saved to LocalStorage) */
export interface GameProgress {
  /** Data format version for migrations */
  dataVersion: number
  /** IDs of unlocked skill tree nodes */
  unlockedNodes: string[]
  /** Stage results keyed by stageId */
  stageResults: Record<string, StageResult>
  /** Tutorial status keyed by nodeId */
  tutorialStatus: Record<string, TutorialStatus>
}

/** LocalStorage save key */
export const SAVE_KEY = 'vimquest_save_v1'

/** Create fresh game progress (new game) */
export function createInitialProgress(): GameProgress {
  return {
    dataVersion: 1,
    unlockedNodes: ['N01'],
    stageResults: {},
    tutorialStatus: {},
  }
}

/** Skill tree node definition (static data) */
export interface SkillNodeDef {
  /** Node ID (e.g., "N01") */
  id: string
  /** Commands unlocked by this node */
  commands: string[]
  /** Display name */
  name: string
  /** Number of stages in this node */
  stageCount: number
  /** Prerequisite node IDs */
  prerequisites: string[]
}

/** Skill tree edge (for Dagre layout) */
export interface SkillTreeEdge {
  source: string
  target: string
}

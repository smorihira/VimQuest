import type { Stage } from '../../types/stage'
import { N01_STAGES } from './N01'
import { N02_STAGES } from './N02'
import { N18_STAGES } from './N18'

/** All stages keyed by stage ID */
export const ALL_STAGES: Record<string, Stage> = Object.fromEntries(
    [...N01_STAGES, ...N02_STAGES, ...N18_STAGES].map((s) => [s.id, s]),
)

/** Get all stages for a given node */
export function getStagesByNode(nodeId: string): Stage[] {
    return Object.values(ALL_STAGES).filter((s) => s.nodeId === nodeId)
}

/** Get a single stage by ID */
export function getStage(stageId: string): Stage | undefined {
    return ALL_STAGES[stageId]
}

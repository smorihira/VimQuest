import type { Stage } from '../../types/stage'
import type { Tutorial } from '../../types/tutorial'
import { MOTION_STAGES } from './motion'
import { EDIT_STAGES } from './edit'
import { MODE_STAGES } from './mode'
import { SEARCH_STAGES } from './search'
import { OPERATOR_STAGES } from './operator'
import { TEXTOBJ_STAGES } from './textobj'
import { LINEWISE_STAGES } from './linewise'
import { VISUAL_STAGES } from './visual'
import { VISUAL_ADV_STAGES } from './visual-adv'
import { REGISTER_STAGES } from './register'
import { SHORTCUT_STAGES } from './shortcut'
import { STRUCT_JUMP_STAGES } from './struct-jump'
import { MOTION_ADV_STAGES } from './motion-adv'
import { OPERATOR_ADV_STAGES } from './operator-adv'
import { NUMBER_STAGES } from './number'
import { SCROLL_MARK_STAGES } from './scroll-mark'
import { SCREEN_STAGES } from './screen'

const ALL_STAGE_ARRAYS: Stage[][] = [
  MOTION_STAGES,
  EDIT_STAGES,
  MODE_STAGES,
  SEARCH_STAGES,
  OPERATOR_STAGES,
  TEXTOBJ_STAGES,
  LINEWISE_STAGES,
  VISUAL_STAGES,
  VISUAL_ADV_STAGES,
  REGISTER_STAGES,
  SHORTCUT_STAGES,
  STRUCT_JUMP_STAGES,
  MOTION_ADV_STAGES,
  OPERATOR_ADV_STAGES,
  NUMBER_STAGES,
  SCROLL_MARK_STAGES,
  SCREEN_STAGES,
]

/** All stages keyed by stage ID */
export const ALL_STAGES: Record<string, Stage> = Object.fromEntries(
  ALL_STAGE_ARRAYS.flat().map((s) => [s.id, s]),
)

/** Get all stages for a given node (practice stages sorted to end) */
export function getStagesByNode(nodeId: string): Stage[] {
  const stages = ALL_STAGE_ARRAYS.flat().filter((s) => s.nodeId === nodeId)
  return stages.sort((a, b) => {
    const ap = a.type === 'practice' ? 1 : 0
    const bp = b.type === 'practice' ? 1 : 0
    return ap - bp
  })
}

/** Get a single stage by ID */
export function getStage(stageId: string): Stage | undefined {
  return ALL_STAGES[stageId]
}

/** Check if a stage has tutorial steps */
export function hasTutorial(stageId: string): boolean {
  const stage = ALL_STAGES[stageId]
  return stage?.tutorial != null && stage.tutorial.length > 0
}

/** Build a Tutorial object from a stage's embedded data */
export function getTutorial(stageId: string): Tutorial | undefined {
  const stage = ALL_STAGES[stageId]
  if (!stage?.tutorial || stage.tutorial.length === 0) return undefined
  return {
    nodeId: stage.nodeId,
    stageId: stage.id,
    newCommands: stage.newCommands,
    initialSetup: stage.tutorialSetup,
    steps: stage.tutorial,
  }
}

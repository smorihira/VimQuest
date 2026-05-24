import type { Stage } from '../../types/stage'
import { N01_STAGES } from './N01'
import { N02_STAGES } from './N02'
import { N03_STAGES } from './N03'
import { N04_STAGES } from './N04'
import { N05_STAGES } from './N05'
import { N06_STAGES } from './N06'
import { N07_STAGES } from './N07'
import { N08_STAGES } from './N08'
import { N09_STAGES } from './N09'
import { N10_STAGES } from './N10'
import { N11_STAGES } from './N11'
import { N12_STAGES } from './N12'
import { N13_STAGES } from './N13'
import { N14_STAGES } from './N14'
import { N15_STAGES } from './N15'
import { N16_STAGES } from './N16'
import { N17_STAGES } from './N17'
import { N18_STAGES } from './N18'
import { N19_STAGES } from './N19'
import { N20_STAGES } from './N20'
import { N21_STAGES } from './N21'
import { N22_STAGES } from './N22'
import { N23_STAGES } from './N23'
import { N24_STAGES } from './N24'
import { N25_STAGES } from './N25'
import { N26_STAGES } from './N26'
import { N27_STAGES } from './N27'
import { N28_STAGES } from './N28'
import { N29_STAGES } from './N29'
import { N30_STAGES } from './N30'
import { N31_STAGES } from './N31'
import { N32_STAGES } from './N32'
import { N33_STAGES } from './N33'
import { N34_STAGES } from './N34'
import { N35_STAGES } from './N35'

const ALL_STAGE_ARRAYS: Stage[][] = [
    N01_STAGES,
    N02_STAGES,
    N03_STAGES,
    N04_STAGES,
    N05_STAGES,
    N06_STAGES,
    N07_STAGES,
    N08_STAGES,
    N09_STAGES,
    N10_STAGES,
    N11_STAGES,
    N12_STAGES,
    N13_STAGES,
    N14_STAGES,
    N15_STAGES,
    N16_STAGES,
    N17_STAGES,
    N18_STAGES,
    N19_STAGES,
    N20_STAGES,
    N21_STAGES,
    N22_STAGES,
    N23_STAGES,
    N24_STAGES,
    N25_STAGES,
    N26_STAGES,
    N27_STAGES,
    N28_STAGES,
    N29_STAGES,
    N30_STAGES,
    N31_STAGES,
    N32_STAGES,
    N33_STAGES,
    N34_STAGES,
    N35_STAGES,
]

/** All stages keyed by stage ID */
export const ALL_STAGES: Record<string, Stage> = Object.fromEntries(
    ALL_STAGE_ARRAYS.flat().map((s) => [s.id, s]),
)

/** Get all stages for a given node */
export function getStagesByNode(nodeId: string): Stage[] {
    return ALL_STAGE_ARRAYS.flat().filter((s) => s.nodeId === nodeId)
}

/** Get a single stage by ID */
export function getStage(stageId: string): Stage | undefined {
    return ALL_STAGES[stageId]
}

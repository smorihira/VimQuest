import type { Tutorial } from '../../types/tutorial'
import {
  N01_1_TUTORIAL,
  N01_2_TUTORIAL,
  N01_3_TUTORIAL,
  N01_4_TUTORIAL,
  N01_5_TUTORIAL,
  N01_6_TUTORIAL,
  N01_7_TUTORIAL,
  N01_8_TUTORIAL,
  N01_9_TUTORIAL,
  N01_C_TUTORIAL,
} from './N01'
import { N02_T_TUTORIAL, N02_Ta_TUTORIAL } from './N02'
import { N03_T_TUTORIAL } from './N03'
import { N04_T_TUTORIAL } from './N04'
import { N05_T_TUTORIAL } from './N05'
import { N06_T_TUTORIAL, N06_Ta_TUTORIAL } from './N06'
import { N07_T_TUTORIAL } from './N07'
import { N08_T_TUTORIAL, N08_Ta_TUTORIAL, N08_Tb_TUTORIAL } from './N08'
// N09 (cオペレータ) は未実装
import { N10_T_TUTORIAL, N10_Ta_TUTORIAL, N10_Tb_TUTORIAL } from './N10'
import { N11_T_TUTORIAL } from './N11'
import { N12_T_TUTORIAL } from './N12'
import { N13_T_TUTORIAL } from './N13'
import { N14_T_TUTORIAL, N14_Ta_TUTORIAL } from './N14'
// N15 (数値操作 Ctrl+a/x) は未実装
import { N16_T_TUTORIAL } from './N16'
import { N17_T_TUTORIAL } from './N17'
import { N18_T_TUTORIAL, N18_Ta_TUTORIAL } from './N18'
import { N19_T_TUTORIAL, N19_Ta_TUTORIAL } from './N19'
import { N20_T_TUTORIAL } from './N20'
import { N21_T_TUTORIAL, N21_Ta_TUTORIAL, N21_Tb_TUTORIAL } from './N21'
import { N22_T_TUTORIAL } from './N22'

/** All tutorials keyed by stage ID or node ID */
const TUTORIALS: Record<string, Tutorial> = {
  'N01-1': N01_1_TUTORIAL,
  'N01-2': N01_2_TUTORIAL,
  'N01-3': N01_3_TUTORIAL,
  'N01-4': N01_4_TUTORIAL,
  'N01-5': N01_5_TUTORIAL,
  'N01-6': N01_6_TUTORIAL,
  'N01-7': N01_7_TUTORIAL,
  'N01-8': N01_8_TUTORIAL,
  'N01-9': N01_9_TUTORIAL,
  'N01-C': N01_C_TUTORIAL,
  'N02-T': N02_T_TUTORIAL,
  'N02-Ta': N02_Ta_TUTORIAL,
  'N03-T': N03_T_TUTORIAL,
  'N04-T': N04_T_TUTORIAL,
  'N05-T': N05_T_TUTORIAL,
  'N06-T': N06_T_TUTORIAL,
  'N06-Ta': N06_Ta_TUTORIAL,
  'N07-T': N07_T_TUTORIAL,
  'N08-T': N08_T_TUTORIAL,
  'N08-Ta': N08_Ta_TUTORIAL,
  'N08-Tb': N08_Tb_TUTORIAL,
  'N10-T': N10_T_TUTORIAL,
  'N10-Ta': N10_Ta_TUTORIAL,
  'N10-Tb': N10_Tb_TUTORIAL,
  'N11-T': N11_T_TUTORIAL,
  'N12-T': N12_T_TUTORIAL,
  'N13-T': N13_T_TUTORIAL,
  'N14-T': N14_T_TUTORIAL,
  'N14-Ta': N14_Ta_TUTORIAL,
  'N16-T': N16_T_TUTORIAL,
  'N17-T': N17_T_TUTORIAL,
  'N18-T': N18_T_TUTORIAL,
  'N18-Ta': N18_Ta_TUTORIAL,
  'N19-T': N19_T_TUTORIAL,
  'N19-Ta': N19_Ta_TUTORIAL,
  'N20-T': N20_T_TUTORIAL,
  'N21-T': N21_T_TUTORIAL,
  'N21-Ta': N21_Ta_TUTORIAL,
  'N21-Tb': N21_Tb_TUTORIAL,
  'N22-T': N22_T_TUTORIAL,
}

/** Check if a stage or node has a tutorial (stageId first, then nodeId fallback) */
export function hasTutorial(stageId: string, nodeId?: string): boolean {
  if (stageId in TUTORIALS) return true
  return nodeId !== undefined && nodeId in TUTORIALS
}

/** Get tutorial for a stage or node (stageId first, then nodeId fallback) */
export function getTutorial(stageId: string, nodeId?: string): Tutorial | undefined {
  return TUTORIALS[stageId] ?? (nodeId !== undefined ? TUTORIALS[nodeId] : undefined)
}

/** Get all tutorials (for testing/validation) */
export function getAllTutorials(): Record<string, Tutorial> {
  return TUTORIALS
}

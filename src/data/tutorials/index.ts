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
    N01_C_TUTORIAL,
} from './N01'

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
    'N01-C': N01_C_TUTORIAL,
    // N15, N25, N33 will be added later
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

import type { Tutorial } from '../../types/tutorial'
import { N01_TUTORIAL } from './N01'
import { N02_TUTORIAL } from './N02'

/** All tutorials keyed by node ID */
export const TUTORIALS: Record<string, Tutorial> = {
  N01: N01_TUTORIAL,
  N02: N02_TUTORIAL,
  // N03, N08, N18, N29, N37 will be added later
}

/** Check if a node has a tutorial */
export function hasTutorial(nodeId: string): boolean {
  return nodeId in TUTORIALS
}

/** Get tutorial for a node */
export function getTutorial(nodeId: string): Tutorial | undefined {
  return TUTORIALS[nodeId]
}

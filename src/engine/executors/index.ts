/**
 * Barrel export for all executor modules.
 */

export {
  lines,
  join,
  clampCursor,
  lineLen,
  lineCount,
  isWordChar,
  isSpace,
  pushUndo,
  deleteRange,
  offsetToPos,
} from './helpers'

export { resolveMotion, isMotionInclusive, executeMotion, moveFirstNonBlank } from './motions'

export {
  executeOperatorMotion,
  resolveTextObject,
  executeOperatorTextObject,
  applyOperator,
  resolveLineRange,
} from './operators'
export type { OperatorRange } from './operators'

export {
  executeInsertBefore,
  executeInsertAfter,
  executeInsertLineStart,
  executeInsertLineEnd,
  executeOpenBelow,
  executeOpenAbove,
  executeEscape,
  executeInsertText,
  executeBackspace,
  finalizeInsertSession,
} from './insertMode'

export {
  executeDeleteChar,
  executeUndo,
  executeRedo,
  executeReplace,
  executeToggleCase,
  executeDeleteToEnd,
  executeChangeToEnd,
  executeJoinLines,
  executePaste,
  executePasteBefore,
  executeSubstitute,
  executeSubstituteLine,
  executeSearch,
  executeSearchNext,
  executeSearchPrev,
  executeSearchWordForward,
  executeSearchWordBackward,
  clampViewport,
  ensureCursorVisible,
  executeHalfPageDown,
  executeHalfPageUp,
  executeViewportZZ,
  executeViewportZT,
  executeViewportZB,
  executeVisualChar,
  executeVisualLine,
} from './normalCommands'

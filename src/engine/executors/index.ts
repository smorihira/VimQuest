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
  executeCaseChange,
  executeOperatorTextObject,
} from './operators'

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
  executeDeleteLine,
  executeDeleteToEnd,
  executeChangeToEnd,
  executeJoinLines,
  executePaste,
  executePasteBefore,
  executeSubstitute,
  executeSubstituteLine,
  executeIndent,
  executeDedent,
  executeSearch,
  executeSearchNext,
  executeSearchPrev,
  executeSearchWordForward,
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

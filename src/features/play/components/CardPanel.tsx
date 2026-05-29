/**
 * CardPanel — displays HAND cards and BASE row during play.
 */

import { playTick } from '../../../engine/sound'
import {
  getCardClass,
  getPendingOperator,
  buildCardDisplayList,
  displayLabel,
} from '../commandMetadata'

interface CardPanelProps {
  mode: string
  availableCommands: readonly string[]
  visualCommands?: readonly string[]
  parserBuffer: string
  showBase: boolean
  baseCommands?: readonly string[]
  baseExpanded: boolean
  setBaseExpanded: (fn: (v: boolean) => boolean) => void
  nodeId?: string
}

export function CardPanel({
  mode,
  availableCommands,
  visualCommands,
  parserBuffer,
  showBase,
  baseCommands,
  baseExpanded,
  setBaseExpanded,
  nodeId,
}: CardPanelProps) {
  return (
    <div className="play-card-panel">
      <div className="card-label-row">
        {mode === 'insert' && <span className="card-label">INSERT</span>}
        {showBase && mode !== 'insert' && (
          <button
            className={`base-toggle${baseExpanded ? ' expanded' : ''}`}
            onClick={() => {
              setBaseExpanded((v) => !v)
              playTick()
            }}
            title="BASE コマンド表示切替 (?)"
          >
            BASE {baseExpanded ? '▾' : '▸'}
          </button>
        )}
      </div>
      {mode === 'insert' ? (
        <div className="insert-info">
          <span className="insert-chars">入力中…</span>
          <span className="insert-esc">Esc で確定</span>
        </div>
      ) : (
        <>
          {showBase && baseExpanded && baseCommands && (
            <div className="base-row">
              {(mode === 'visual'
                ? baseCommands.filter((c) => c !== 'v' && c !== 'V' && c !== 'Ctrl+v')
                : baseCommands
              ).map((cmd) => (
                <span key={cmd} className={`base-card ${getCardClass(cmd)}`}>
                  {displayLabel(cmd)}
                </span>
              ))}
            </div>
          )}
          <div className="card-row">
            {buildCardDisplayList(
              mode === 'visual' && visualCommands ? visualCommands : availableCommands,
              nodeId,
            ).map((item) => {
              const cmd = item.cmd
              const pendingOp = getPendingOperator(parserBuffer)
              const isOperator = ['d', 'c', 'y', '>', '<'].includes(cmd)
              const isTarget = !isOperator && !['u', 'Esc', '.'].includes(cmd)
              const isPending = pendingOp === cmd
              const isDisabled = pendingOp && isOperator && cmd !== pendingOp

              let cardState = ''
              if (isPending) cardState = ' card-pending'
              else if (pendingOp && isTarget) cardState = ' card-target'
              else if (isDisabled) cardState = ' card-disabled'

              return (
                <div key={cmd} className={`card ${getCardClass(cmd)}${cardState}`}>
                  {displayLabel(cmd)}
                  {item.hint && <span className="card-hint">{item.hint}</span>}
                </div>
              )
            })}
          </div>
        </>
      )}
      {parserBuffer && <div className="parser-buffer">{parserBuffer}_</div>}
      {getPendingOperator(parserBuffer) && (
        <div className="textobj-ref">
          <span className="textobj-ref-label">TextObj:</span>
          <span className="textobj-ref-target">i</span>
          <span className="textobj-ref-target">a</span>
          <span className="textobj-ref-sep">|</span>
          {['w', 's', 'p', '"', "'", '(', '{', '[', '<'].map((t) => (
            <span key={t} className="textobj-ref-target">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

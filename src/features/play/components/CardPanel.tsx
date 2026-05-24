/**
 * CardPanel — displays HAND cards and BASE row during play.
 */

import { BASE_COMMANDS } from '../../../data/constants'
import { playTick } from '../../../engine/sound'
import { getCardClass, getCardHint, getPendingOperator } from '../commandMetadata'

interface CardPanelProps {
  mode: string
  availableCommands: readonly string[]
  visualCommands?: readonly string[]
  parserBuffer: string
  lastExecutedRaw: string
  showBase: boolean
  baseExpanded: boolean
  setBaseExpanded: (fn: (v: boolean) => boolean) => void
}

export function CardPanel({
  mode,
  availableCommands,
  visualCommands,
  parserBuffer,
  lastExecutedRaw,
  showBase,
  baseExpanded,
  setBaseExpanded,
}: CardPanelProps) {
  return (
    <div className="play-card-panel">
      <div className="card-label-row">
        <span className="card-label">{mode === 'insert' ? 'INSERT' : 'HAND'}</span>
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
          {showBase && baseExpanded && (
            <div className="base-row">
              {(mode === 'visual'
                ? BASE_COMMANDS.filter((c) => c !== 'v' && c !== 'V' && c !== 'Ctrl+v')
                : BASE_COMMANDS
              ).map((cmd) => (
                <span key={cmd} className={`base-card ${getCardClass(cmd)}`}>
                  {cmd}
                </span>
              ))}
            </div>
          )}
          <div className="card-row">
            {(mode === 'visual' && visualCommands
              ? [
                  ...availableCommands.filter((c) => c !== 'v' && c !== 'V' && c !== 'Ctrl+v'),
                  ...visualCommands,
                ]
              : availableCommands
            ).map((cmd) => {
              const pendingOp = getPendingOperator(parserBuffer)
              const isOperator = ['d', 'c', 'y', '>', '<'].includes(cmd)
              const isTarget = !isOperator && !['u', 'Esc', '.'].includes(cmd)
              const isPending = pendingOp === cmd
              const isDisabled = pendingOp && isOperator && cmd !== pendingOp
              const isMerged =
                lastExecutedRaw.length > 1 && lastExecutedRaw.startsWith(cmd) && isOperator

              let cardState = ''
              if (isPending) cardState = ' card-pending'
              else if (pendingOp && isTarget) cardState = ' card-target'
              else if (isDisabled) cardState = ' card-disabled'
              if (isMerged) cardState += ' card-merged'

              return (
                <div key={cmd} className={`card ${getCardClass(cmd)}${cardState}`}>
                  {isMerged ? lastExecutedRaw : cmd}
                  {getCardHint(cmd) && <span className="card-hint">{getCardHint(cmd)}</span>}
                </div>
              )
            })}
          </div>
        </>
      )}
      {parserBuffer && <div className="parser-buffer">{parserBuffer}_</div>}
    </div>
  )
}

/**
 * Data Integrity Tests
 *
 * B1: Tutorial stageId references a valid stage
 * B2: Tutorial expectedKeys are available in the stage's commands
 * C1: All skill tree nodes are reachable from N01
 * C3: All prerequisites reference valid nodes
 */

import { describe, it, expect } from 'vitest'
import { getAllTutorials } from '../data/tutorials'
import { ALL_STAGES, getStage } from '../data/stages'
import { SKILL_NODES, SKILL_NODE_MAP } from '../data/skillTree'
import { BASE_COMMANDS, getBaseForStage } from '../data/constants'

// ─── B: Tutorial Data Integrity ──────────────────────────────────────

const TUTORIALS = getAllTutorials()

describe('Tutorial data integrity', () => {
  for (const [key, tutorial] of Object.entries(TUTORIALS)) {
    describe(`${key} (stageId=${tutorial.stageId})`, () => {
      // B1: stageId references a valid stage
      it('stageId references an existing stage', () => {
        const stage = getStage(tutorial.stageId)
        expect(stage, `stage ${tutorial.stageId} not found`).toBeDefined()
      })

      // B1: nodeId references a valid node
      it('nodeId references an existing node', () => {
        expect(SKILL_NODE_MAP[tutorial.nodeId], `node ${tutorial.nodeId} not found`).toBeDefined()
      })

      // B2: every expectedKey is available in the stage's commands + base
      it('all expectedKeys are available commands', () => {
        const stage = getStage(tutorial.stageId)
        if (!stage) return // covered by B1

        const base = getBaseForStage(stage) ?? []
        const allCommands = new Set([
          ...stage.availableCommands,
          ...(stage.visualCommands ?? []),
          ...base,
        ])

        // Always-available keys (not part of stage commands but usable in tutorials)
        const builtinKeys = new Set([
          'Esc',
          'Enter',
          'Backspace',
          'Ctrl+R',
          'Ctrl+d',
          'Ctrl+u',
          'Ctrl+v',
          'u',
          ':',
          '/',
        ])

        for (const step of tutorial.steps) {
          if (step.expectedKey === null) continue // info step, any key
          if (step.type === 'hold_space') continue // Space hold step
          if (step.type === 'colon_command') continue // handled separately
          if (step.type === 'search') continue // handled separately

          const key = step.expectedKey
          if (builtinKeys.has(key)) continue

          // Single character keys (typing, motion targets, etc.) are always valid
          if (key.length === 1) continue

          // Multi-char expectedKeys: "dd", "f{", "dt1", "ci\"", ""ayiw", "gUiw", ">>"
          // Check that this key (or its operator prefix) exists in availableCommands
          // or that one of the available commands shares the same operator prefix
          const hasCommand =
            allCommands.has(key) || // exact match (e.g. "dd", "gg", ">>")
            [...allCommands].some((cmd) => {
              // The expectedKey uses the same operator/motion as an available command
              // e.g. expectedKey "diw" matches available "dd" (both use 'd' operator)
              // e.g. expectedKey "cf;" matches available "ciw" (both use 'c' operator)
              if (cmd.length === 0 || key.length === 0) return false
              // Strip register prefix from both
              const cmdBase = cmd[0] === '"' && cmd.length >= 3 ? cmd.slice(2) : cmd
              const keyBase = key[0] === '"' && key.length >= 3 ? key.slice(2) : key
              // Compare leading operator/motion character
              return cmdBase[0] === keyBase[0]
            })

          expect(
            hasCommand,
            `expectedKey "${key}" has no matching operator in availableCommands for ${stage.id} (available: ${[...allCommands].join(', ')})`,
          ).toBe(true)
        }
      })
    })
  }
})

// ─── C: Skill Tree Integrity ─────────────────────────────────────────

describe('Skill tree integrity', () => {
  // C3: All prerequisites reference valid nodes
  it('all prerequisites reference existing nodes', () => {
    for (const node of SKILL_NODES) {
      for (const pre of node.prerequisites) {
        expect(
          SKILL_NODE_MAP[pre],
          `node ${node.id} has prerequisite "${pre}" which doesn't exist`,
        ).toBeDefined()
      }
    }
  })

  // C1: All nodes are reachable from N01
  it('all nodes are reachable from N01', () => {
    const reachable = new Set<string>()
    const queue = ['N01']
    reachable.add('N01')

    // Build adjacency: prerequisite → dependent
    const dependents = new Map<string, string[]>()
    for (const node of SKILL_NODES) {
      for (const pre of node.prerequisites) {
        if (!dependents.has(pre)) dependents.set(pre, [])
        dependents.get(pre)!.push(node.id)
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!
      const children = dependents.get(current) ?? []
      for (const child of children) {
        if (!reachable.has(child)) {
          reachable.add(child)
          queue.push(child)
        }
      }
    }

    for (const node of SKILL_NODES) {
      expect(reachable.has(node.id), `node ${node.id} is not reachable from N01`).toBe(true)
    }
  })

  // Every stage's nodeId maps to a valid node (already in balanceValidator, but good to cross-check)
  it('every stage belongs to a valid node', () => {
    const allStages = Object.values(ALL_STAGES)
    for (const stage of allStages) {
      expect(
        SKILL_NODE_MAP[stage.nodeId],
        `stage ${stage.id} references non-existent node ${stage.nodeId}`,
      ).toBeDefined()
    }
  })

  // C2: Every availableCommand in a stage must be learnable by the time the player reaches that node
  // i.e. it must be in: self node commands ∪ transitive prerequisite commands ∪ BASE_COMMANDS
  // Composite commands (e.g. "dw") are learnable if the operator ("d") appears in any learnable composite
  describe('C2: stage availableCommands are learnable', () => {
    // Build transitive prerequisite commands for each node (cached)
    const learnableCache = new Map<string, Set<string>>()
    function getLearnableCommands(nodeId: string): Set<string> {
      if (learnableCache.has(nodeId)) return learnableCache.get(nodeId)!
      const result = new Set<string>()
      const visited = new Set<string>()
      const queue = [nodeId]
      while (queue.length > 0) {
        const id = queue.shift()!
        if (visited.has(id)) continue
        visited.add(id)
        const node = SKILL_NODE_MAP[id]
        if (!node) continue
        for (const cmd of node.commands) result.add(cmd)
        for (const pre of node.prerequisites) queue.push(pre)
      }
      for (const cmd of BASE_COMMANDS) result.add(cmd)
      learnableCache.set(nodeId, result)
      return result
    }

    // Extract known operator prefixes from a learnable set
    // e.g. if "dw" is learnable, operator "d" is known
    const OPERATOR_CHARS = new Set(['d', 'c', 'y', '>', '<', '!'])
    function isCommandLearnable(cmd: string, learnable: Set<string>): boolean {
      if (learnable.has(cmd)) return true

      // Register prefix: "a → if any "x exists in learnable, register usage is known
      if (cmd.startsWith('"') && cmd.length >= 2) {
        const hasRegister = [...learnable].some((l) => l.startsWith('"'))
        if (hasRegister) {
          // Check the command after register prefix
          return cmd.length === 2 || isCommandLearnable(cmd.slice(2), learnable)
        }
        return false
      }

      // g-prefix operators: gU, gu, g~
      if (cmd.startsWith('gU') || cmd.startsWith('gu') || cmd.startsWith('g~')) {
        const op = cmd.slice(0, 2)
        return [...learnable].some((l) => l.startsWith(op))
      }

      // Operator+motion composite: dw, ciw, yy, etc.
      if (cmd.length > 1 && OPERATOR_CHARS.has(cmd[0])) {
        return [...learnable].some((l) => l.length > 0 && l[0] === cmd[0])
      }

      // Single-char operator (visual mode): d, c, y, etc.
      if (cmd.length === 1 && OPERATOR_CHARS.has(cmd)) {
        return [...learnable].some((l) => l.length > 0 && l[0] === cmd)
      }

      // Doubled operator: >>, <<
      if (cmd.length === 2 && cmd[0] === cmd[1] && OPERATOR_CHARS.has(cmd[0])) {
        return [...learnable].some((l) => l[0] === cmd[0])
      }

      return false
    }

    const allStages = Object.values(ALL_STAGES)
    for (const stage of allStages) {
      it(`${stage.id}: availableCommands ⊆ learnable commands`, () => {
        const learnable = getLearnableCommands(stage.nodeId)

        for (const cmd of stage.availableCommands) {
          expect(
            isCommandLearnable(cmd, learnable),
            `stage ${stage.id} uses command "${cmd}" which is not learnable at node ${stage.nodeId} (learnable: ${[...learnable].sort().join(', ')})`,
          ).toBe(true)
        }
      })

      if (stage.visualCommands) {
        it(`${stage.id}: visualCommands ⊆ learnable commands`, () => {
          const learnable = getLearnableCommands(stage.nodeId)

          for (const cmd of stage.visualCommands!) {
            expect(
              isCommandLearnable(cmd, learnable),
              `stage ${stage.id} uses visual command "${cmd}" which is not learnable at node ${stage.nodeId}`,
            ).toBe(true)
          }
        })
      }
    }
  })
})

// ─── D: Tutorial newCommands coverage ────────────────────────────────

// Commands not yet covered by any tutorial's newCommands (TODO: remove as tutorials are created)
const UNCOVERED_COMMANDS: Record<string, string[]> = {
  N02: ['X'],
  N04: ['?'],
  N05: ['P'],
  N06: ['s', 'p', "'", '(', '{', '[', '<'],
  N08: ['o'],
  N11: ['Y'],
  N12: ['(', ')', '{', '}', '[[', ']]'],
  N13: ['g~'],
  N14: ['F', 'T', 'H', 'M', 'L'],
  N16: ['Ctrl+f', 'Ctrl+b', 'm', "'", '`', 'gi'],
  N17: ['Ctrl+e', 'Ctrl+y'],
}

describe('Tutorial newCommands coverage', () => {
  // Build union of newCommands per node from all tutorials
  const newCommandsByNode = new Map<string, Set<string>>()
  for (const tutorial of Object.values(TUTORIALS)) {
    if (!newCommandsByNode.has(tutorial.nodeId)) {
      newCommandsByNode.set(tutorial.nodeId, new Set())
    }
    const set = newCommandsByNode.get(tutorial.nodeId)!
    for (const cmd of tutorial.newCommands) {
      set.add(cmd)
    }
  }

  for (const node of SKILL_NODES) {
    const uncovered = new Set(UNCOVERED_COMMANDS[node.id] ?? [])
    const expected = new Set(node.commands.filter((cmd) => !uncovered.has(cmd)))
    const actual = newCommandsByNode.get(node.id) ?? new Set()

    it(`${node.id} (${node.name}): tutorial newCommands cover node commands`, () => {
      // Every non-uncovered node command must appear in some tutorial's newCommands
      for (const cmd of expected) {
        expect(
          actual.has(cmd),
          `${node.id} command "${cmd}" is not covered by any tutorial's newCommands`,
        ).toBe(true)
      }
    })

    it(`${node.id} (${node.name}): tutorial newCommands ⊆ node commands`, () => {
      // Every tutorial newCommand must be a valid node command
      for (const cmd of actual) {
        expect(
          node.commands.includes(cmd),
          `tutorial for ${node.id} declares newCommand "${cmd}" which is not in node.commands`,
        ).toBe(true)
      }
    })
  }
})

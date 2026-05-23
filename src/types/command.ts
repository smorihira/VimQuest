/**
 * Command categories for hand card display and parsing logic.
 * Commands are identified by string keys (e.g., 'dw', 'ci"').
 * This file defines the parsed command structure, not the raw key input.
 */

/** Operator verbs that combine with motions/text objects */
export type Operator = 'd' | 'c' | 'y' | 'gu' | 'gU' | '>' | '<'

/** Motion targets */
export type Motion =
    | 'h' | 'j' | 'k' | 'l'
    | 'w' | 'b' | 'e'
    | 'W' | 'B' | 'E'
    | '0' | '$' | '^'
    | 'gg' | 'G'
    | 'f' | 'F' | 't' | 'T'
    | ';' | ','
    | '%'
    | 'n' | 'N'
    | '*' | '#'
    | 'gj' | 'gk'

/** Text objects (always paired with i/a prefix in raw input) */
export type TextObject =
    | 'iw' | 'aw'
    | 'i"' | 'a"'
    | "i'" | "a'"
    | 'i(' | 'a(' | 'i)' | 'a)'
    | 'i{' | 'a{' | 'i}' | 'a}'
    | 'i[' | 'a[' | 'i]' | 'a]'
    | 'i<' | 'a<' | 'i>' | 'a>'
    | 'it' | 'at'

/** Parsed command — output of the command parser */
export interface Command {
    /** Raw key sequence as typed (e.g., "3dw", "ci\"", "x") */
    raw: string

    /** Numeric prefix (undefined if none) */
    count?: number

    /** Operator if this is an operator command */
    operator?: Operator

    /** Motion target */
    motion?: Motion

    /** Text object target */
    textObject?: TextObject

    /** Character argument for f/t/r commands */
    char?: string

    /** Search pattern for / command */
    searchPattern?: string

    /** Whether this command is valid and executable */
    valid: boolean
}

/** XState parser states */
export type ParseState =
    | 'idle'
    | 'numberPrefix'
    | 'operatorPending'
    | 'textobjPending'
    | 'gPending'
    | 'guPending'
    | 'gUPending'
    | 'zPending'
    | 'charPending'
    | 'operatorCharPending'
    | 'searchInput'
    | 'replacePending'

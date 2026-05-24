/**
 * Sound engine using Web Audio API.
 * Generates synthetic sounds — no external audio files needed.
 */

let audioCtx: AudioContext | null = null
let muted = false

function getCtx(): AudioContext {
    if (!audioCtx) {
        audioCtx = new AudioContext()
    }
    return audioCtx
}

export function setMuted(m: boolean) {
    muted = m
    try {
        localStorage.setItem('vq-muted', m ? '1' : '0')
    } catch {
        /* storage unavailable */
    }
}

export function isMuted(): boolean {
    return muted
}

export function initMuteFromStorage() {
    try {
        muted = localStorage.getItem('vq-muted') === '1'
    } catch {
        /* storage unavailable */
    }
}

// Initialize on import
initMuteFromStorage()

function playTone(freq: number, duration: number, volume: number, type: OscillatorType = 'sine') {
    if (muted) return
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
}

/** Short click for valid command execution */
export function playTick() {
    playTone(800, 0.05, 0.08, 'square')
}

/** Soft key sound for insert mode typing */
export function playType() {
    playTone(600, 0.03, 0.04, 'sine')
}

/** Buzz for invalid input */
export function playError() {
    playTone(150, 0.12, 0.1, 'sawtooth')
}

/** Pop sound for star reveal */
export function playStar() {
    playTone(1200, 0.15, 0.1, 'sine')
    setTimeout(() => playTone(1600, 0.1, 0.06, 'sine'), 50)
}

/** Ascending chime for stage clear */
export function playClear() {
    playTone(523, 0.15, 0.08, 'sine')
    setTimeout(() => playTone(659, 0.15, 0.08, 'sine'), 100)
    setTimeout(() => playTone(784, 0.2, 0.1, 'sine'), 200)
}

/** Short thud for locked node click */
export function playLock() {
    playTone(100, 0.1, 0.06, 'triangle')
}

/** Low rumble for game over */
export function playGameOver() {
    playTone(80, 0.4, 0.1, 'sawtooth')
}

/** Sparkle chime for hint reveal */
export function playHint() {
    playTone(880, 0.12, 0.06, 'sine')
    setTimeout(() => playTone(1100, 0.1, 0.05, 'sine'), 80)
    setTimeout(() => playTone(660, 0.15, 0.04, 'sine'), 160)
}

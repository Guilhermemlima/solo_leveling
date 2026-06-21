// Central GSAP setup — import this before using gsap anywhere to avoid SSR issues
import { gsap } from 'gsap'

// Ease shortcuts used throughout the app
export const EASE_OUT_EXPO = 'expo.out'
export const EASE_OUT_BACK = 'back.out(1.4)'
export const EASE_IN_OUT = 'power3.inOut'

export { gsap }

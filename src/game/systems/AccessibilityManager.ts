import { SettingsManager } from './SettingsManager.ts'

class AccessibilityManagerClass {
  /** Returns duration in ms, or 0 if reduced motion is enabled. */
  animDuration(ms: number): number {
    return SettingsManager.get('reducedMotion') ? 0 : ms
  }

  /** Reduced version for bedtime: halved again. */
  bedtimeAnimDuration(ms: number): number {
    if (SettingsManager.get('reducedMotion')) return 0
    return SettingsManager.get('bedtimeMode') ? Math.floor(ms / 2) : ms
  }
}

export const AccessibilityManager = new AccessibilityManagerClass()

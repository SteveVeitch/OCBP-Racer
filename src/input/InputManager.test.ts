import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DEFAULT_KEY_BINDINGS } from './InputManager'

describe('InputManager', () => {
  describe('DEFAULT_KEY_BINDINGS', () => {
    it('has all required actions', () => {
      expect(DEFAULT_KEY_BINDINGS.throttle).toBeDefined()
      expect(DEFAULT_KEY_BINDINGS.brake).toBeDefined()
      expect(DEFAULT_KEY_BINDINGS.steerLeft).toBeDefined()
      expect(DEFAULT_KEY_BINDINGS.steerRight).toBeDefined()
      expect(DEFAULT_KEY_BINDINGS.pause).toBeDefined()
      expect(DEFAULT_KEY_BINDINGS.confirm).toBeDefined()
      expect(DEFAULT_KEY_BINDINGS.back).toBeDefined()
      expect(DEFAULT_KEY_BINDINGS.cameraSwitch).toBeDefined()
    })

    it('all actions have at least one key', () => {
      for (const [action, keys] of Object.entries(DEFAULT_KEY_BINDINGS)) {
        expect(keys.length).toBeGreaterThan(0)
      }
    })

    it('throttle uses W and ArrowUp', () => {
      expect(DEFAULT_KEY_BINDINGS.throttle).toContain('KeyW')
      expect(DEFAULT_KEY_BINDINGS.throttle).toContain('ArrowUp')
    })

    it('brake uses S and ArrowDown', () => {
      expect(DEFAULT_KEY_BINDINGS.brake).toContain('KeyS')
      expect(DEFAULT_KEY_BINDINGS.brake).toContain('ArrowDown')
    })

    it('steer left uses A and ArrowLeft', () => {
      expect(DEFAULT_KEY_BINDINGS.steerLeft).toContain('KeyA')
      expect(DEFAULT_KEY_BINDINGS.steerLeft).toContain('ArrowLeft')
    })

    it('steer right uses D and ArrowRight', () => {
      expect(DEFAULT_KEY_BINDINGS.steerRight).toContain('KeyD')
      expect(DEFAULT_KEY_BINDINGS.steerRight).toContain('ArrowRight')
    })

    it('pause uses Escape', () => {
      expect(DEFAULT_KEY_BINDINGS.pause).toContain('Escape')
    })

    it('confirm uses Enter and Space', () => {
      expect(DEFAULT_KEY_BINDINGS.confirm).toContain('Enter')
      expect(DEFAULT_KEY_BINDINGS.confirm).toContain('Space')
    })

    it('no duplicate keys across actions', () => {
      const sharedKeys = ['Escape']
      const allKeys: string[] = []
      for (const keys of Object.values(DEFAULT_KEY_BINDINGS)) {
        for (const key of keys) {
          if (!sharedKeys.includes(key)) {
            expect(allKeys).not.toContain(key)
          }
          allKeys.push(key)
        }
      }
    })
  })
})

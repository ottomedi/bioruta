import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  // La sesión vive en localStorage: sin esto, un test entraría con la del anterior.
  localStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

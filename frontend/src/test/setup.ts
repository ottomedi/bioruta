import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Con toda la batería en paralelo (y en el CI) un segundo de espera se queda corto.
configure({ asyncUtilTimeout: 3000 })

afterEach(() => {
  cleanup()
  // La sesión vive en localStorage: sin esto, un test entraría con la del anterior.
  localStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

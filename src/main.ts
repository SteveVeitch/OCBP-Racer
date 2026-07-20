const params = new URLSearchParams(window.location.search)

if (params.has('test')) {
  console.log('[OCBP Racer] Test mode enabled')
  import('./test-harness').then(({ runTestHarness }) => {
    runTestHarness().catch(err => {
      console.error('Test harness failed:', err)
    })
  })
} else {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  if (!gl) {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a1a;color:#ff3366;font-family:system-ui;text-align:center;padding:20px;">
        <div>
          <h1 style="font-size:28px;margin-bottom:12px;">WebGL Not Available</h1>
          <p style="color:#aaa;font-size:16px;">OCBP Racer requires WebGL to run.<br>Please use a modern browser (Chrome, Firefox, Edge, or Safari).</p>
        </div>
      </div>`
  } else {
    import('./core/Game').then(({ Game }) => {
      const game = new Game()
      game.init().catch(err => {
        console.error('[OCBP Racer] Init failed:', err)
      })
    })
  }
}

const params = new URLSearchParams(window.location.search)

if (params.has('test')) {
  console.log('[OCBP Racer] Test mode enabled')
  import('./test-harness').then(({ runTestHarness }) => {
    runTestHarness().catch(err => {
      console.error('Test harness failed:', err)
    })
  })
} else {
  import('./core/Game').then(({ Game }) => {
    const game = new Game()
    game.init().catch(err => {
      console.error('[OCBP Racer] Init failed:', err)
    })
  })
}

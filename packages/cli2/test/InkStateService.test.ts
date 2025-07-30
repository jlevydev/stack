import { it } from 'vitest'
import { Effect, Layer, ManagedRuntime } from 'effect'
import { BunContext } from '@effect/platform-bun'
import { getInkState, InkStateService, setCurrentKey } from '../src/effects/InkStateService'

// TODO: Figure out snapshot testing
// TODO: Investigate runtimes and state sharing further and port back to main app
it('testSettingNewCurrentKey', async ({ expect }) => {
    const InkStateLive = Layer.provide(InkStateService.Default, BunContext.layer)
    const runtime = ManagedRuntime.make(InkStateLive)
    runtime.runPromise(setCurrentKey("h")).then((inkState) => {
        expect(inkState).toStrictEqual({
            currentKey: "h", directories: ["bastion", "cli", "cli2", "infrastructure", "ink-app", "installer", "nix", "scraper", "vault", "website"]
        })
    })
})
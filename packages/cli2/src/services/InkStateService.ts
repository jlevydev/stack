import { Effect, Ref } from "effect"
import { FileSystem } from "@effect/platform" // TODO: Maybe dump

interface IEnvironment {
    directory: string
    focused: boolean
}

interface IMainViewProps {
    directories: string[]
    currentKey: string
}

// TODO: Do we want to not use the .Serivce helper here? Docs are mixed on usage and it seems like it abstracts a lot
class InkStateService extends Effect.Service<InkStateService>()("InkStateService", {



    effect: Effect.gen(function* () {

        const fs = yield* FileSystem.FileSystem
        // TODO: Figure out how to handle errors and get guarantee of launch of service within these generator effects
        const directories = yield* fs.readDirectory("/home/josh/personal/stack/packages")

        const inkState = yield* Ref.make<IMainViewProps>({
            directories: directories,
            currentKey: ""
        })

        return {
            getState: Ref.get(inkState),
            updateCurrentKey: (key: string) =>
                Ref.update(inkState, state => ({ ...state, currentKey: key })),
            updateState: (newState: IMainViewProps) =>
                Ref.update(inkState, () => (newState))
        } as const
    }),
    dependencies: []
}) { }

// TODO: Where should the below live. The functions we've defined are so simple this is what actually runs them
// So should we be testing these or rewriting something equivalent for our tests?
const getInkState = Effect.gen(function* () {
    const inkStateService = yield* InkStateService
    return yield* inkStateService.getState
})

const setCurrentKey = (key: string) => Effect.gen(function* () {
    const inkStateService = yield* InkStateService
    yield* inkStateService.updateCurrentKey(key)
    return yield* inkStateService.getState
})

export {
    InkStateService,
    IMainViewProps,
    getInkState,
    setCurrentKey
}
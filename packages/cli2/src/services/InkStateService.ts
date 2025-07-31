import { Effect, Ref } from "effect"

interface IMainViewProps {
    directories: string[]
    currentKey: string
}

// TODO: Do we want to not use the .Serivce helper here? Docs are mixed on usage and it seems like it abstracts a lot
class InkStateService extends Effect.Service<InkStateService>()("InkStateService", {
    effect: Effect.gen(function* () {
        const inkState = yield* Ref.make<IMainViewProps>({
            directories: [],
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

export {
    InkStateService,
    IMainViewProps,
}
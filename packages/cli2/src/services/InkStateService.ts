import { Effect, Ref, SubscriptionRef } from "effect"

enum View {
    Environments,
    Regions,
    Workflows,
}

interface ListItem {
    focused: boolean
}

interface Environemnt extends ListItem {
    name: string
    slaTarget: number
}

interface IMainViewProps {
    currentView: View
    currentList: ListItem[]
    environments: Environemnt[]
}

// TODO: Do we want to not use the .Serivce helper here? Docs are mixed on usage and it seems like it abstracts a lot
class InkStateService extends Effect.Service<InkStateService>()("InkStateService", {
    effect: Effect.gen(function* () {
        const inkState = yield* SubscriptionRef.make<IMainViewProps>({
            currentView: View.Environments,
            environments: [],
            currentList: []
        })

        return {
            inkState: inkState,
            getState: Ref.get(inkState),
            updateCurrentKey: (key: string) =>
                // TODO: Interesting no type checking here
                Ref.update(inkState, state => ({ ...state, currentKey: key })),
            updateState: (newState: IMainViewProps) =>
                Ref.update(inkState, () => (newState)),
            navigateDown: () => Effect.gen(function* () {
                const state = yield* inkState
                // TODO: figure out which list to use
                let focusNext = false
                let currentEnvironment: Environemnt | undefined
                for (let i = 0; i < state.environments.length; i++) {
                    currentEnvironment = state.environments[i]
                    // TODO: Figure out typing here around | undefined
                    if (currentEnvironment === undefined) {
                        continue
                    }

                    const wasFocused = currentEnvironment.focused

                    if (focusNext) {
                        currentEnvironment.focused = true
                        focusNext = false
                    } else if (i !== state.environments.length - 1) {
                        currentEnvironment.focused = false
                    }

                    if (wasFocused && i !== state.environments.length - 1) {
                        focusNext = true
                    }

                    state.environments[i] = currentEnvironment
                }
                yield* Ref.update(inkState, () => state)
            }),
            navigateUp: () => Effect.gen(function* () {
                const state = yield* inkState
                // TODO: figure out which list to use
                let focusNext = false
                let currentEnvironment: Environemnt | undefined
                for (let i = state.environments.length - 1; i >= 0; i--) {
                    currentEnvironment = state.environments[i]
                    // TODO: Figure out typing here around | undefined
                    if (currentEnvironment === undefined) {
                        continue
                    }

                    const wasFocused = currentEnvironment.focused

                    if (focusNext) {
                        currentEnvironment.focused = true
                        focusNext = false
                    } else if (i !== 0) {
                        currentEnvironment.focused = false
                    }

                    if (wasFocused && i !== 0) {
                        focusNext = true
                    }

                    state.environments[i] = currentEnvironment
                }
                yield* Ref.update(inkState, () => state)
            })
        } as const
    }),
    dependencies: []
}) { }

export {
    InkStateService,
    type IMainViewProps,
    View
}
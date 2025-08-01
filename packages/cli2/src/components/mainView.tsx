import React, {useState, useEffect, useMemo} from 'react';
import {Box, Text, useInput} from 'ink';
import { InkStateService, View, type IMainViewProps } from '../services/InkStateService.js';
import { Effect, Exit, Fiber, Layer, ManagedRuntime, Stream } from 'effect';
import { FileSystemService } from '../services/FileSystemService.js';
import { PanfactumConfigService } from '../services/PanfactumConfigService.js'

const MainView: React.FC = () => {
    
    const [viewState, setViewState] = useState<IMainViewProps | undefined>()
    
    const GlobalConfigLive = Layer.mergeAll(PanfactumConfigService.Default, FileSystemService.Default, InkStateService.Default)
    const runtime = useMemo(() => ManagedRuntime.make(GlobalConfigLive), []) // TODO: Understand this better

    useEffect(() => {
        runtime.runPromiseExit(Effect.gen(function* () {
            const configService = yield* PanfactumConfigService
            const config =  yield* configService.bootstrapPanfactumConfig
            const inkStateService = yield* InkStateService
            const inkState = config.environments.map((config) => {
                return {
                    name: config.environment,
                    slaTarget: config.sla_target,
                    focused: false
                }
            })
            // TODO: handle zero case
            if (inkState[0]) {
                inkState[0].focused = true
            }
            yield* inkStateService.updateState({
                currentView: View.Environments,
                environments: inkState
            })
            return {
                currentView: View.Environments,
                environments: inkState
            }
        })).then((result) => {
            Exit.match(result, {
                onFailure: (cause) => {console.log(`${cause}`)},
                onSuccess: (viewProps) => {
                    setViewState(viewProps)
                }
            })
        })

        const stateHandlerFiber = runtime.runFork(Effect.gen(function* () {
            const inkStateService = yield* InkStateService
            yield* Stream.runForEach(inkStateService.inkState.changes, view => Effect.sync(() => {
                setViewState(view)
            }))
        }))

        return () => {Effect.runFork(Fiber.interrupt(stateHandlerFiber))}
    }, [runtime])

    // TODO: Schema validation at I/O boundary here
    useInput((input, key) => {
        runtime.runPromiseExit(Effect.gen(function* () {
            const inkService = yield* InkStateService
            if (key.downArrow) {
                yield* inkService.navigateDown()
            }
            if (key.upArrow) {
                yield* inkService.navigateUp()
            }
            return yield* inkService.updateCurrentKey(input)
        })).then((result) => {
            Exit.match(result, {
                onFailure: (cause) => {console.log(`${cause}`)},
                onSuccess: () => {}
            })
        })
    })

    if (viewState === undefined) {
        return null
    }

	return (
        <Box flexDirection='column' borderStyle='round'>
            <Box flexDirection='row' height='13%' borderStyle='round'>
                <Box width='25%' borderStyle='round'><Text color="green">Welcome to Panfactum!</Text></Box>
                <Box width='50%' borderStyle='round'><Text color="green">Current Environment: Look below</Text></Box>
                <Box width='25%' borderStyle='round'><Text color="green">Background Processes: 0</Text></Box>
            </Box>
            <Box flexDirection='column' height='87%' borderStyle='round' justifyContent='flex-start'>
                <Text>Environments:</Text>
                {viewState.environments.map((env, index) => 
                <Box borderStyle='round' key={index}>
                    <Text color={env.focused ? "yellow" : "green"}>{env.name}{env.slaTarget}</Text>
                </Box>
                )}
            </Box>
        </Box>
    );
};

export default MainView;
import React, {useState, useEffect} from 'react';
import {Box, Text, useInput} from 'ink';
import { InkStateService, IMainViewProps, getInkState, setCurrentKey } from '../services/InkStateService.js';
import { Effect, Exit, Layer, ManagedRuntime } from 'effect';
import { BunContext } from '@effect/platform-bun';
import { FileSystemService } from '../services/FileSystemService.js';
import {PanfactumConfigService } from '../services/PanfactumConfigService.js'

const MainView: React.FC = () => {
    
    const [viewState, setViewState] = useState<IMainViewProps | undefined>()
    
    // TODO: Odd to me that InkStateLive can have a PlatformFailure but that doesn't trickle up in the type system when we use it to run events
    // Maybe something to consider as we draw our application boundaries that services should default launch
    const InkStateLive = Layer.provide(InkStateService.Default, BunContext.layer)
    const GlobalConfigLive = Layer.mergeAll(PanfactumConfigService.Default, FileSystemService.Default, InkStateLive)
    const runtime = ManagedRuntime.make(GlobalConfigLive)

    useEffect(() => {
        runtime.runPromiseExit(Effect.gen(function* () {
            const configService = yield* PanfactumConfigService
            return yield* configService.bootstrapPanfactumConfig
        })).then((result) => {
            Exit.match(result, {
                onFailure: (cause) => {console.log(`${cause}`)},
                onSuccess: (viewProps) => {setViewState({
                    directories: viewProps.environments,
                    currentKey: "YAY!"
                })}
            })
        })
        // runtime.runPromiseExit(getInkState).then((inkState) => {
        //     Exit.match(inkState, {
        //         onFailure: (cause) => {},
        //         onSuccess: (viewProps) => {setViewState(viewProps)}
        //     })
        // })
    }, [])

    // TODO: Schema validation at I/O boundary here
    useInput((input, key) => {
        runtime.runPromise(setCurrentKey(input)).then((inkState) => {
            setViewState(inkState)
        })
    })

    if (viewState === undefined) {
        return null
    }

	return (
        <Box flexDirection='column' borderStyle='round'>
            <Box flexDirection='row' height='13%' borderStyle='round'>
                <Box width='25%' borderStyle='round'><Text color="green">Welcome to Panfactum!</Text></Box>
                <Box width='50%' borderStyle='round'><Text color="green">Current Environment: {viewState.currentKey}</Text></Box>
                <Box width='25%' borderStyle='round'><Text color="green">Background Processes: 0</Text></Box>
            </Box>
            <Box flexDirection='column' height='87%' borderStyle='round' justifyContent='flex-start'>
                <Text>Environments:</Text>
                {viewState.directories.map((dir, index) => 
                <Box borderStyle='round' key={index}>
                    <Text color="green">{dir}</Text>
                </Box>
                )}
            </Box>
        </Box>
    );
};

export default MainView;
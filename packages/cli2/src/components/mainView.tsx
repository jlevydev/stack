import React, {useState, useEffect} from 'react';
import {Box, Text, useInput} from 'ink';
import { InkStateService, IMainViewProps, getInkState, setCurrentKey } from '../effects/InkStateService.js';
import { Effect, Layer, ManagedRuntime } from 'effect';
import { BunContext } from '@effect/platform-bun';

const MainView: React.FC = () => {
    
    const [viewState, setViewState] = useState({
        directories: [],
        currentKey: ""
    } as IMainViewProps)
    
    // TODO: Odd to me that InkStateLive can have a PlatformFailure but that doesn't trickle up in the type system when we use it to run events
    // Maybe something to consider as we draw our application boundaries that services should default launch
    const InkStateLive = Layer.provide(InkStateService.Default, BunContext.layer)
    const runtime = ManagedRuntime.make(InkStateLive)

    useEffect(() => {
        runtime.runPromise(getInkState).then((inkState) => {
            setViewState(inkState)
        })
    }, [])

    // TODO: Schema validation at I/O boundary here
    useInput((input, key) => {
        runtime.runPromise(setCurrentKey(input)).then((inkState) => {
            setViewState(inkState)
        })
    })

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
import { Box, Text, useInput } from "ink";
import React, { useEffect, useState } from "react";

interface ListViewProps {
    getColumns: () => string[]
    getRows: () => string[][]
}

const ListView: React.FC<ListViewProps> = ({getColumns, getRows}) => {

    const [columns, setColumns] = useState<string[] | undefined>()
    const [rows, setRows] = useState<string[][] | undefined>()
    const [currentRow, setCurrentRow] = useState(0)

    const navigateDown = () => {
        if (rows === undefined) {
            return
        }

        if (currentRow === rows.length - 1) {
            return
        }

        setCurrentRow(currentRow + 1)
    }

    const navigateUp = () => {
        if (rows === undefined) {
            return
        }

        if (currentRow === 0) {
            return
        }

        setCurrentRow(currentRow - 1)
    }

    useEffect(() => {
        setColumns(getColumns())
        setRows(getRows())
    }, [])

    useInput((_, key) => {
        if (key.downArrow) {
            navigateDown()
        }
        if (key.upArrow) {
            navigateUp()
        }
    })

    if (rows === undefined || columns === undefined) {
        return null
    }
    
    return (
        <Box flexDirection="column">
            <Box flexBasis="row" borderStyle='double' justifyContent='space-evenly'>
                {columns.map((column, index) => 
                <Box key={index} borderStyle='single'>
                    <Text>{column}</Text>
                </Box>
                )}
            </Box>
            {rows.map((row, index) => 
                // TODO: Refactor this implementation: I have a feeling keeping the items as rows will be hard for styling
                // Alt to try is keeping everything in columns so columns can have even dynamic spacing based on contents
                <Box key={index} borderStyle={index === currentRow ? 'single' : 'classic'} justifyContent='space-evenly'> 
                    {row.map((value, index) =>
                    <Box key={index} borderStyle='single'>
                        <Text>{value}</Text>
                    </Box>
                    )}
                </Box>
            )}
        </Box>
    )
}

export default ListView
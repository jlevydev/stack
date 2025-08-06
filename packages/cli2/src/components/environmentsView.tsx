import React from "react"
import ListView from "./listView.tsx"


const EnvironmentsView: React.FC = () => {

    const getColumns = () => {
        return ["ColOne", "ColTwo", "ColThree"]
    }

    const getRows = () => {
        return [
            ["OneOne", "OneTwo", "OneThree"],
            ["TwoOne", "TwoTwo", "TwoThree"],
            ["ThreeOne", "ThreeTwo", "ThreeThree"]
        ]
    }

    return <ListView getColumns={getColumns} getRows={getRows}></ListView>
}

export default EnvironmentsView
import * as React from 'react'
import {Checkbox, TextField} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import hyperactiv from 'hyperactiv'

const { observe, computed, dispose } = hyperactiv

export function rxContext() {
    const cells = {}
    const observed = observe(cells)
    const cellsController = {
        getCellValue(cellName) {
            return observed[cellName]
        },
        setCellValue(cellName, value) {
            observed[cellName] = value
            console.log(JSON.stringify(observed))
        },
        onCellChanged(cellName, callback) {
            const onChange = computed(() => {
                const cellValue = observed[cellName]
                callback(cellValue)
            })

            function unsub() {
                dispose(onChange)
            }

            return unsub
        },
    }
    const reactCellsContext = React.createContext(cellsController)
    observed.checked = true

    return {
        cellsController,
        reactCellsContext,
    }
}

const {reactCellsContext} = rxContext()

export function RxCheckBox(props) {
    const cellsController = React.useContext(reactCellsContext)
    const { getCellValue, setCellValue, onCellChanged} = cellsController
    const { cell } = props
    const [checked, setChecked] = React.useState(getCellValue(cell.value));
    const [visible, setVisible] = React.useState(getCellValue(cell.visible));

    React.useEffect(() => {
        console.log('mount', cell.value)
        //mount
        const unsub = [
            onCellChanged(cell.value,setChecked),
            onCellChanged(cell.visible,setVisible),
        ]

        function cleanup() {//unmount
            console.log('unmount', cell.value)
            unsub.map(f => f());
        }
        return cleanup
    }, []);
    const handleChange = (event) => {
        setCellValue(cell.value, event.target.checked)

    };
    return visible && <Checkbox value={checked} onChange={handleChange}/> || null
}

export function AutocompleteLab() {
    const [value, setValue] = React.useState(options[0])
    const [inputValue, setInputValue] = React.useState('')

    return (
        <Autocomplete
            value={value}
            onChange={(_, newValue) => {
                setValue(newValue)
            }}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => {
                setInputValue(newInputValue)
            }}
            options={['Foo', 'Bar']}
            style={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="Name" variant="outlined" />}
        />
    )
}
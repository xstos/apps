import * as React from 'react'
import ReactDOM from 'react-dom'
import {store, view} from '@risingstack/react-easy-state';
import {Checkbox, FormControlLabel, TextField} from "@mui/material";
import * as objectPathSet from "object-path-set"
import hyperactiv from 'hyperactiv'
const { observe, computed } = hyperactiv

import Autocomplete from "@mui/material/Autocomplete";
import {ALL_POSSIBLE_POS_LIST} from "./data";
import {AutocompleteLab, RxCheckBox} from "./components";

const noValidation = () => ({error: false, text: ''})
const onboardingTypes = ['oo', 'pat']

const fieldTypes = {
    text: 'text',
    combo: 'combo',
    bool: 'bool',
}
const RESTAURANT_ID = {
    name: 'Restaurant Id',
    type: fieldTypes.text,
    path: 'RESTAURANT_ID',
    value: '',
    validation: noValidation
}
const ONBOARDING_TYPE = {
    name: 'Onboarding type',
    type: fieldTypes.combo,
    path: 'ONBOARDING_TYPE',
    value: 'oo',
    validation: noValidation,
    valueInfo: onboardingTypes,
}
const IS_PAT_MERCHANT_OF_RECORD = {
    name: 'Is PAT Merchant of Record',
    type: fieldTypes.bool,
    path: 'IS_PAT_MERCHANT_OF_RECORD',
    value: false,
    validation: merchantOfRecordValidator,
}
const DESCRIPTION_EN = {
    name: 'English description',
    type: fieldTypes.text,
    path: 'description.en',
    value: '',
    validation: validationExample,
}
const DESCRIPTION_FR = {
    name: 'French description',
    type: fieldTypes.text,
    path: 'description.fr',
    value: '',
    validation: validationExample,
}
const POS = {
    name: 'POS',
    type: fieldTypes.combo,
    path: 'common.POS',
    value: ALL_POSSIBLE_POS_LIST[0],
    validation: lsValidator,
    valueInfo: [...ALL_POSSIBLE_POS_LIST]
}
const LS_ID = {
    name: 'LIGHTSPEED ID',
    type: fieldTypes.text,
    path: 'common.id',
    value: '',
    validation: lsValidator,
}
const LS_SERVER = {
    name: 'LIGHTSPEED Server',
    type: fieldTypes.text,
    path: 'common.server',
    value: '',
    validation: lsValidator,
}

function lsValidator() {
    const isLS = getValue(POS.path, '') === 'LIGHTSPEED'
    if (!isLS) {
        setValue(LS_ID.path, '')
        setValue(LS_SERVER.path, '')
    }
    return {
        error: false,
        text: '',
        disabled: !isLS,
    }
}

const fields = [
    RESTAURANT_ID,
    ONBOARDING_TYPE,
    IS_PAT_MERCHANT_OF_RECORD,
    DESCRIPTION_EN,
    DESCRIPTION_FR,
    POS,
    LS_ID,
    LS_SERVER,
]
function makeCells() {
    return fields.reduce((accum, {path,value}) => {
        accum[path]={value, disabled: undefined}
        return accum
    },{})
}
const state = store({fields, data: {}})
const madeCells = makeCells()
const cells = observe(madeCells)
fields.forEach(field=>{

    computed(()=>{
        const cell = cells[field.path]
        console.log('value changed ',field.path, cell.value)
        state.data[field.path]=cell.value
    })
})
computed(() => {
    const onboardingType = cells[ONBOARDING_TYPE.path].value
    const cell = cells[IS_PAT_MERCHANT_OF_RECORD.path]
    cell.disabled = onboardingType==='oo'
    if (cell.disabled) {
        cell.value = IS_PAT_MERCHANT_OF_RECORD.value
    }
})



function merchantOfRecordValidator() {
    const onboardingTypeIsOO = getValue(ONBOARDING_TYPE.path, 'oo') === 'oo'
    if (onboardingTypeIsOO) {
        setValue(IS_PAT_MERCHANT_OF_RECORD.path, false)
    }
    return {
        error: false,
        text: '',
        disabled: onboardingTypeIsOO,

    }
}

function validationExample() { //these will be refactored centrally over time w/ DRY
    const val = getValue('description.en', '')
    const empty = val.length < 1
    const containsSpaces = val.includes(' ')
    return {
        error: empty || containsSpaces,
        text: [empty && 'Must be non empty', containsSpaces && 'Must not contain spaces'].filter(v => v).join(', ')
    }
}

function setValue(path, value) {
    //console.log('setValue', path, value)
    setTimeout(()=>{
        if (cells[path].value===value) return
        cells[path].value = value
        //if (state.data[path]===value) return
        //state.data[path] = value
    },1)

}

function getValue(path, defaultValue = undefined) {
    const ret = state.data[path]
    return ret || defaultValue
}

function Field(props) {
    const {name, type, path, validation, valueInfo} = props
    const value = getValue(path, props.value)
    const validationResult = validation()

    function setValue2(value) {
        setValue(path, value)
    }

    function Combo() {
        console.log('render combo', {value, valueInfo, name})

        return <Autocomplete
            value={value}
            autoSelect
            disablePortal
            disableClearable
            id="combo-box-demo"
            sx={{width: 300}}
            options={valueInfo}
            renderInput={(params) => {
                return <TextField {...params} label={name}/>;
            }}
            onChange={(evt, newValue) => {
                setValue2(newValue)
            }}
        />
    }
    function Text() {
        //console.log('textfield', name, value, validationResult.disabled)
        return <TextField error={validationResult.error} helperText={validationResult.text} label={name}
                          defaultValue={value}
                          onChange={(evt) => {
                              setValue2(evt.target.value)
                          }}
                          disabled={validationResult.disabled || false}
        />
    }
    function Bool() {
        const chk = <Checkbox key={path} checked={value} disabled={validationResult.disabled}
                              onChange={(evt, newValue) => {
                                  setValue2(newValue)
                              }
                              }/>
        return <FormControlLabel control={chk} label={name}/>
    }

    switch (type) {
        case 'text':
            return <><Text/></>
        case 'combo':
            return <><Combo/></>
        case 'bool':
            //console.log('chkbox', value)
            return <><Bool/></>
    }
}
const EasyField = view(Field)
function App(props) {
    return (
        <div style={{display: "block"}}>
            <RxCheckBox cell={{
                value: 'checked',
                visible: 'checked.visible'
            }}></RxCheckBox>
            <RxCheckBox cell={{
                value: 'checked.visible'
            }}></RxCheckBox>
            {fields.map((field => {
                return <div style={{marginTop: '1ch'}}><EasyField {...field}></EasyField></div>
            }))}
            <br/>
            Json structure:<br/>
            <pre>
            {JSON.stringify(pathsToNestedObject(state.data))}
            </pre>
        </div>
    )
}

function pathsToNestedObject(flatObj) {
    let ret = {}
    Object.keys(flatObj).forEach(k => objectPathSet(ret, k, flatObj[k]))
    return ret
}

ReactDOM.render(React.createElement(view(App)), document.getElementById('root'))

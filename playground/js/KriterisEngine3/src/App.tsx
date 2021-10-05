import './App.global.css'
import * as React from "react";
import ReactDOM from 'react-dom'
import { useEffect, useState } from 'react'
import { store, view } from '@risingstack/react-easy-state';
import * as _ from 'lodash'
import {Paper, TextField} from "@material-ui/core";

const state = store({
    inputBoxValue: "",
    keys: [],

})
const map = {
    ['\n']: "↵",
    ['\t']: '⇥'
}
function Render(props) {
    function mapKeys(key, i) {
        return <span key={i}>{map[key] || key}</span>;
    }
    function textFieldChanged(e) {
        state.keys = e.target.value.split('')
    }
    return <Paper elevation={3} >
        <TextField
            style={{width: "100%"}}
            label="Paste here"
            multiline
            rows={4}
            onChange={textFieldChanged}
            inputProps={{
                style: {fontFamily: "monospace"}
            }}
        />
        <pre style={{fontSize: '18px'}}>
            {state.keys.map(mapKeys)}
        </pre>
    </Paper>
}

export function App() {
    const WrappedView = view(Render)
    return <WrappedView/>
}

// onKeyPressed((key)=>{
//     state.keys.push(key)
// })
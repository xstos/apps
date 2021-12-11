import './App.global.css'
import * as React from "react";
import ReactDOM from 'react-dom'
import { useEffect, useState } from 'react'
import { store, view } from '@risingstack/react-easy-state';
import * as _ from 'lodash'
import {makeStyles, Paper, TextField} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles({
    grid: {
        width: '100%',
        height: '100%',
        border: '5px solid red'
    },
});

const state = store({
    inputBoxValue: "",
    keys: [],

})
const map = {
    ['\n']: "↵",
    ['\t']: '⇥'
}
function Render(props) {
    return <DockContainer></DockContainer>
}
function r(n) {
    var ret =[]
    for (let j = 0; j < n; j++) {
        ret.push(j)
    }
    return ret
}
function DockContainer(props) {
    const classes = useStyles();
    let style = {width: "100%", fontFamily: "monospace"};
    return <div style={style}>{r(2000).map(i=><span>{i}</span>)}</div>

}
export function App() {
    const WrappedView = view(Render)
    return <WrappedView/>
}

// onKeyPressed((key)=>{
//     state.keys.push(key)
// })
import './index.css';
import React, {useEffect, useRef, useState} from "react";
import ReactDOM from 'react-dom'
import hyperactiv from 'hyperactiv'
import {stringify} from "javascript-stringify";
import {cellx} from "cellx"

import {customJsx} from "./reactUtil"
//import {BoxComponent, DragDropDemo} from "./dragdrop"
import {makeGLRenderer} from "./render/wgl"
import {proxyWrapperDemo} from "./experiments/proxyWrapperDemo"
let jsxCallback = customJsx

const {observe, computed} = hyperactiv
//makeGLRenderer()


function notimpl() {
  throw new Error("not implemented")
}

document.body.style.color = "grey"
document.body.style.backgroundColor = "rgb(28,28,28)"

export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  return jsxCallback(type, props, ...children)
}

proxyWrapperDemo()
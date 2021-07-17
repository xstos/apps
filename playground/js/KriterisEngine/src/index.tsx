import { App } from './app'
import { App2 } from './experimental/app2/app2'
import { App3 } from './experimental/app2/app3'
import { InjectedPropsBase } from './experimental/app2/InjectedPropsbase'
import { MillionLetters } from './experimental/app2/MillionLetters'
import { CanvasRawPixels } from './experimental/app2/CanvasRawPixels'
import { App6 } from './experimental/app2/app6'
import { App7 } from './experimental/app2/app7'
import { Persist } from './experimental/app2/persist'

document.addEventListener('DOMContentLoaded', OnLoad)

function OnLoad() {
  Persist()
}

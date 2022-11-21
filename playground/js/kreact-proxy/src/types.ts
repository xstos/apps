//todo: idea: typescript needs map filter reduce i.e. pairs(SomeType).map(pair=> SomeOtherType)
import * as jsondiffpatch from "jsondiffpatch"
import {Delta} from "jsondiffpatch"

type TPartialState = Partial<TState>
type TMutatorObj = { [Prop in keyof TPartialState]: Function | TPartialState[Prop] }
type TMutatorFun = (s: TState) => TMutatorObj
export type TMutator = TMutatorObj | TMutatorFun
type TStatePatternMatcher<T> = Function | T
export type TPattern = { [Prop in keyof TPartialState]: [TStatePatternMatcher<TPartialState[Prop]>, TStatePatternMatcher<TPartialState[Prop]>] | Function }
export const NOKEY = '$NIL'
export type TJsx = { type: string; props: { [key: string]: any }, children: any[]; }
//todo box dragger https://codepen.io/knobo/pen/WNeMYjO
const initialStateSansDiff = {
  mouseState: 'unknown',
  mouseButton: -1,
  mouseMove: false,
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0,
  x: 0,
  y: 0,
  dragging: false,
  el: '',
  hoverElId: T<string>(''),
  hoverBounds: {
    left: 0,
    right: 0,
    width: 0,
  },
  hoverBefore: true,
  selectedItemIds: T<string[]>([]),
  key: NOKEY,
  nodes: T<TNode[]>([]),
  lastId: 1,
}
export const initialState = {
  ...initialStateSansDiff,
  diff: T<Delta>(jsondiffpatch.diff({}, initialStateSansDiff) as Delta),
}
type TStateSansDiff = typeof initialStateSansDiff
type TStyle = {
  pointerEvents: any,
  position: any,
  transform: any,
  borderLeft: any,
  borderRight: any,
}
export type TNode = { id: number, v: string, sl: boolean, style: TStyle }
export type TState = typeof initialState
export type TStateFunc = ((o?: Partial<TState>, push?: boolean) => TState) & { getPrevious: () => TState }
export type TRule = (s: TState) => (Partial<TState> | null)
export function T<T>(o: T) {
  return o
}
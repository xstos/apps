export type TState = {
    todos: string[]
    value: string
    error?: string
}

export interface TActionBase {
    type: string
}
export class TActionDbGet implements TActionBase {
    type: "db.get"
    success: boolean
    response: TState
    error: string
}
export class TActionChange implements TActionBase {
    type: "change"
    value: string
}
export class TActionAdd implements TActionBase {
    type: "add"
}
export class TActionRemove implements TActionBase {
    type: "remove"
    index: number
}
export type TAction = TActionDbGet | TActionChange | TActionAdd | TActionRemove

export function getInitialState(): TState { //our initial redux state store
    return {
        todos: [],
        value: "",
    };
}

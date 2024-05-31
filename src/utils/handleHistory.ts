import { BotStateStandAlone } from "@builderbot/bot/dist/types"

export type History = { role: 'user' | 'assistant', content: string }

const handleHistory = async (inside: History, _state: BotStateStandAlone) => {
    const history = _state.get<History[]>('history') ?? []
    history.push(inside)
    await _state.update({ history })
}

const getHistory = (_state: BotStateStandAlone, k = 16) => {
    const history = _state.get<History[]>('history') ?? []
    const limitHistory = history.slice(-k)
    return limitHistory
}

const getHistoryParse = (_state: BotStateStandAlone, k = 16, add = false): string => {
    const history = _state.get<History[]>('history') ?? []
   
    const limitHistory = history.slice(-k)
    let index:number = 1
    return limitHistory.reduce((prev, current) => {
        const role = current.role === 'user' ? 'Cliente' : 'Vendedor'
        const msg = add ? `\n${index}) ${role}: "${current.content}"` : `\n${role}: "${current.content}"`
        prev += msg
        if (add) index++
        return prev
    }, ``)
}

const clearHistory = async (_state: BotStateStandAlone) => {
    _state.clear()
}


export { handleHistory, getHistory, getHistoryParse, clearHistory }
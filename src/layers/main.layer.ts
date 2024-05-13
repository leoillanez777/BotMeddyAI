import { BotContext, BotMethods } from "@bot-whatsapp/bot/dist/types"
import { getHistoryParse } from "../utils/handleHistory"
import AIClass from "../services/ai"
import { Message } from "src/models/chat"
import { flowSeller } from "../flows/seller.flow"
import { flowSchedule } from "../flows/schedule.flow"

/**
 * Determina que flujo va a iniciarse basado en el historial que previo entre el bot y el humano
 */
export default async (ctx: BotContext, { state, gotoFlow, extensions }: BotMethods) => {
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    console.log('Historia en MAIN: ', history)
    
    const msg: Message = { message: ctx.body, history: history }
    const prediction:string = await ai.createChat(msg)

    if (prediction.includes('TALK')) return gotoFlow(flowSeller)
    if (prediction.includes('SCHEDULE')) return gotoFlow(flowSchedule)
}
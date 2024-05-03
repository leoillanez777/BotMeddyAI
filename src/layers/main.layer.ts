import { BotContext, BotMethods } from "@bot-whatsapp/bot/dist/types"
import { getHistoryParse } from "../utils/handleHistory"
import AIClass from "../services/ai"
import { Message } from "src/models/chat"
import { flowSeller } from "../flows/seller.flow"
import { flowSchedule } from "../flows/schedule.flow"

/**
 * Determina que flujo va a iniciarse basado en el historial que previo entre el bot y el humano
 */
export default async (_: BotContext, { state, gotoFlow, extensions }: BotMethods) => {
    const ai = extensions.ai as AIClass
    console.log(state)
    const history = getHistoryParse(state)
    console.log('Historia: ', history)
    
    const msg: Message = { message: '' }
    const prediction = await ai.createChat(msg)

    if (prediction.includes('TALK')) return gotoFlow(flowSeller)
    if (prediction.includes('SCHEDULE')) return gotoFlow(flowSchedule)
}
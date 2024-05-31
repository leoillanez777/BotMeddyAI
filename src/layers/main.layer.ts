import { BotContext, BotMethods } from "@builderbot/bot/dist/types"
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
    const history = getHistoryParse(state, 10, true)
    console.log(`///////// MAIN LAYER (${process.env.APP_NAME}) //////////`)
    console.log(`Historia en MAIN de ${ctx.from}: `, history)
    // TODO: Si envia 2 mensaje a la vez, esperar a conteste el otro.
    const msg: Message = { message: ctx.body, history: history }
    const prediction:string = await ai.createChat(msg, `/${process.env.APP_NAME}`)

    console.log('PREDICTION: 👉🏻', prediction)
    if (prediction.includes('SCHEDULE')) {
        return gotoFlow(flowSchedule)
    }
    else {
        return gotoFlow(flowSeller)
    }
}
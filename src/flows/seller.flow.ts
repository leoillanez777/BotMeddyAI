import { addKeyword, EVENTS } from "@bot-whatsapp/bot"
import { generateTimer } from "../utils/generateTimer"
import { getHistoryParse, handleHistory, getHistory } from "../utils/handleHistory"
import AIClass from "../services/ai"
import { Message } from "src/models/chat"

/**
 * Hablamos con el PROMPT que sabe sobre las cosas basicas del negocio, info, precio, etc.
 */
const flowSeller = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, flowDynamic, extensions }) => {
        try {
            const ai = extensions.ai as AIClass
            const lastMessage = getHistory(state).at(-1)
            const history = getHistoryParse(state)
            console.log('Historia en Seller: ', history)
            
            const msg:Message = { message: lastMessage.content, history: history, phone_number: ctx.from }
            const response = await ai.createChat(msg, '/rag/tecno/seller')

            await handleHistory({ content: response, role: 'assistant' }, state)

            const chunks = response.split(/(?<!\d)\.\s+/g);
            for (const chunk of chunks) {
                await flowDynamic([{ body: chunk.trim(), delay: generateTimer(1000, 2500) }]);
            }
        } catch (err) {
            console.log(`[ERROR]:`, err)
            return
        }
})

export { flowSeller }
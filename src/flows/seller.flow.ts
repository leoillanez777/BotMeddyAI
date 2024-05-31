import { addKeyword, EVENTS } from "@builderbot/bot"
import { generateTimer } from "../utils/generateTimer"
import { getHistoryParse, handleHistory, getHistory } from "../utils/handleHistory"
import AIClass from "../services/ai"
import { Message } from "src/models/chat"
import { generateStickerMessage } from "src/utils/generateSticker"

/**
 * Hablamos con el PROMPT que sabe sobre las cosas basicas del negocio, info, precio, etc.
 */
const flowSeller = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, flowDynamic, extensions, provider }) => {
        try {
            const ai = extensions.ai as AIClass
            const lastMessage = getHistory(state).at(-1)
            const countMessage = getHistory(state).length
            const history = getHistoryParse(state)
            
            await provider.vendor.sendPresenceUpdate('composing', ctx.key.remoteJid)
            

            const msg:Message = { 
                message: lastMessage.content, 
                history: history, 
                method: 'seller',
                phone_number: ctx.from 
            }
            const response = await ai.createChat(msg, `/rag/${process.env.APP_NAME}`)

            // Envio sticker saludando...
            if (countMessage == 1) {
                const stickerMessage = await generateStickerMessage("saludando.gif")
                await provider.vendor.sendMessage(ctx.key.remoteJid, stickerMessage)
            }

            await handleHistory({ content: response, role: 'assistant' }, state)

            const chunks = response.split(/(?<!\d)\.\s+/g);
            for (const chunk of chunks) {
                await provider.vendor.sendPresenceUpdate('composing', ctx.key.remoteJid)
                await flowDynamic([{ body: chunk.trim(), delay: generateTimer(1000, 2500) }]);
            }
        } catch (err) {
            console.log(`[ERROR]:`, err)
            return
        }
})

export { flowSeller }
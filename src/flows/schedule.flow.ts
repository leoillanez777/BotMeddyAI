import { addKeyword, EVENTS } from "@builderbot/bot"
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import AIClass from "../services/ai"
import { RespuestaDelChat } from "../services/ai"
import { getHistoryParse, handleHistory } from "../utils/handleHistory"
import { generateTimer } from "../utils/generateTimer"
import { flowConfirm } from "./confirm.flow"
import { flowSeller } from "./seller.flow"
import { Message } from "src/models/chat"
import { format, parse } from "date-fns"
import { generateStickerMessage } from '../utils/generateSticker'

/**
 * Hable sobre todo lo referente a agendar citas, revisar historial saber si existe huecos disponibles
 */
const flowSchedule = addKeyword<Provider, Database>(EVENTS.ACTION)
.addAction(async (ctx, { extensions, state, flowDynamic, provider, endFlow }) => {
    await provider.vendor.sendPresenceUpdate('composing', ctx.key.remoteJid)
    
    await flowDynamic('Dame un momento para consultar la agenda...')
    const stickerVerificando:boolean | undefined = state.get('verificado')
    if (stickerVerificando == undefined) {
        const stickerMessage = await generateStickerMessage("verificando.gif")
        await provider.vendor.sendMessage(ctx.key.remoteJid, stickerMessage)
        await state.update({'verificado': true})
    }
    
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)

    const msg:Message = { message: ctx.body, history: history, phone_number: ctx.from }
    const resp:RespuestaDelChat = await ai.functionChat(msg, '/turnos/tecno')
    
    if (resp !== undefined) {
        if (Array.isArray(resp)) {
            // Handle array of ResponseChat
            await provider.vendor.sendPresenceUpdate('composing', ctx.key.remoteJid)
            let listaMsg = "Tenemos los siguientes turnos disponible:"
            resp.forEach(async (chat,idx) => {
                listaMsg += `\n${idx + 1}) ${chat.fecha}`
            })
            await flowDynamic(listaMsg)
            await handleHistory({ content: listaMsg, role: 'assistant' }, state)
            return endFlow("Por favor, elige uno de los turnos de la lista.")
        }
        else {
            // Handle single ResponseChat
            if (resp.fecha) {
                const desiredDate = parse(resp.fecha, 'dd/MM/yyyy HH:mm', new Date())
                const identifier = resp.identifier ?? ""
                const formattedTime = format(desiredDate, 'H:mm')
                const formattedDate = format(desiredDate, 'dd/MM/yyyy')
                const message = `¡Genial! Tenemos disponibilidad a las ${formattedTime} el día ${formattedDate}. ¿Te confirmo la reserva? Responde con *sí* para confirmar.`
                await handleHistory({ content: message, role: 'assistant' }, state)
                await state.update({ desiredDate, identifier })
                const chunks = message.split(/(?<!\d)\.\s+/g);
                for (const chunk of chunks) {
                    await provider.vendor.sendPresenceUpdate('composing', ctx.key.remoteJid)
                    await flowDynamic([{ body: chunk.trim(), delay: generateTimer(1500, 2500) }]);
                }
            } else {
                await flowDynamic("😢 Lo siento, no entendí tu mensaje...")
                return endFlow("¿Podrías decirme nuevamente en qué puedo ayudarte?")
            }
        }
    }
}).addAction({ capture: true }, async ({ body }, { gotoFlow, endFlow, state, extensions }) => {
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)

    const msg: Message = { message: body, history: history, method: 'confirm' }
    const confirm:string = await ai.createChat(msg)

    console.log('CONFIRMA?: 👉🏻', confirm)

    await handleHistory({ content: body, role: 'user' }, state)

    if (confirm.includes('ACCEPTED')) return gotoFlow(flowConfirm)
       
    await state.update({ desiredDate: null, identifier: null })

    if (confirm.includes('REJECTED')) return endFlow("Está bien 👍🏻, ¿hay algo más en lo que pueda ayudarte?")
      
    if (confirm.includes('RESCHEDULE')) return gotoFlow(flowSchedule)
    
    return gotoFlow(flowSeller)
})

export { flowSchedule }
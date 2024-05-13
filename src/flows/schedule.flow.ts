import { addKeyword, EVENTS } from "@bot-whatsapp/bot"
import AIClass from "../services/ai";
import { getHistoryParse, handleHistory } from "../utils/handleHistory"
import { generateTimer } from "../utils/generateTimer"
import { flowConfirm } from "./confirm.flow";
import { Message, ResponseChat } from "src/models/chat"
import { format, parse } from "date-fns"
import nlp from 'compromise'
import 'es-compromise'


/**
 * Hable sobre todo lo referente a agendar citas, revisar historial saber si existe huecos disponibles
 */
const flowSchedule = addKeyword(EVENTS.ACTION).addAction(async (ctx, { extensions, state, flowDynamic }) => {
    await flowDynamic('dame un momento para consultar la agenda...')
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    console.log('Historia en Schedule: ', history)

    const msg:Message = { message: ctx.body, history: history, phone_number: ctx.from }
    const resp:ResponseChat = await ai.functionChat(msg, '/turnos/tecno')

    const desiredDate = parse(resp.fecha, 'yyyy/MM/dd HH:mm:ss', new Date())

    const formattedTime = format(desiredDate, 'hh:mm a');
    const formattedDate = format(desiredDate, 'dd/MM/yyyy');
    const message = `¡Perfecto! Tenemos disponibilidad a las ${formattedTime} el día ${formattedDate}. ¿Confirmo tu reserva? *si*`
    await handleHistory({ content: message, role: 'assistant' }, state)
    await state.update({ desiredDate })

    const chunks = message.split(/(?<!\d)\.\s+/g);
    for (const chunk of chunks) {
        await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
    }
}).addAction({ capture: true }, async ({ body }, { gotoFlow, flowDynamic, state }) => {
    const doc = nlp(body.toLowerCase())
    const verbs = doc.verbs().out('array')

    const palabrasClaveConfirmacion = ['si', 'aceptar', 'confirmar', 'listo']

    const confirmado = verbs.some(verb => palabrasClaveConfirmacion.includes(verb))

    if (confirmado) return gotoFlow(flowConfirm)

    await flowDynamic('¿Alguna otra fecha y hora?')
    await state.update({ desiredDate: null })
})

export { flowSchedule }
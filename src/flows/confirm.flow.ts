import { addKeyword, EVENTS } from '@builderbot/bot'
import { clearHistory, handleHistory, getHistoryParse } from "../utils/handleHistory"
import AIClass from "../services/ai"
import { SaveChat } from 'src/models/chat'

const validarDNI = (dni: string): boolean => {
    const formatoValido = /^[\d]{1,3}\.?[\d]{3,3}\.?[\d]{3,3}$/i.test(dni)
    if (!formatoValido) {
        return false
    }

    return true // Usar otro validador
};

/**
 * Encargado de pedir los datos necesarios para registrar el evento en el calendario
 */
const flowConfirm = addKeyword(EVENTS.ACTION).addAction(async (_, { flowDynamic }) => {
    await flowDynamic('Ok, voy a pedirte algunos datos para agendar tu evento.')
    await flowDynamic('¿Cuál es tu nombre?')
}).addAction({ capture: true }, async (ctx, { state, flowDynamic, endFlow }) => {
    if (ctx.body.toLocaleLowerCase().includes("cancelar")) {
        clearHistory(state)
        return endFlow('¿Cómo puedo ayudarte?')
    }
    await state.update({ nombre: ctx.body })
    await flowDynamic('Última pregunta, ¿cuál es tu DNI?')
})
.addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack, endFlow, extensions }) => {
    const dni = ctx.body.trim();
    const esValido = validarDNI(dni);
    if (esValido) {
        await state.update({ dni: ctx.body })
        
        const allState = state.getMyState()
        // Grabar en MongoDB los datos.
        const ai = extensions.ai as AIClass
        const saveData:SaveChat = {
            identifier: allState.identifier,
            nombre: allState.nombre,
            dni: dni
        }

        const result:boolean = await ai.grabarTurno(saveData, '/save')
        if (result) {
            clearHistory(state)
            let msgFinal = '👏🏻 ¡Listo! Evento agendado. Gracias por elegirnos. \n'
            msgFinal += '\n Por favor, preséntate 5 minutos antes de tu turno.'
            msgFinal += '\n Te enviaremos un recordatorio 1 hora antes de la cita'
            await flowDynamic(msgFinal)
        }
        else {
            return endFlow("😭 Lo siento, hubo un inconveniente al reservar la cita. Por favor, inténtalo nuevamente.")
        }
    }
    else {
        return fallBack('Por favor, ingresa un DNI correcto.')
    }
})

export { flowConfirm }
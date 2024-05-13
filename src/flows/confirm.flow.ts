import { addKeyword, EVENTS } from "@bot-whatsapp/bot"
import { clearHistory, handleHistory, getHistoryParse } from "../utils/handleHistory"

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
    await flowDynamic('Ok, voy a pedirte unos datos para agendar')
    await flowDynamic('¿Cuál es tu nombre?')
}).addAction({ capture: true }, async (ctx, { state, flowDynamic, endFlow }) => {
    if (ctx.body.toLocaleLowerCase().includes("cancelar")) {
        clearHistory(state)
        return endFlow('¿Cómo puedo ayudarte?')
    }
    await state.update({ nombre: ctx.body })
    await flowDynamic('Ultima pregunta ¿Cuál es tu DNI?')
})
.addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack }) => {
    const dni = ctx.body.trim();
    const esValido = validarDNI(dni);
    if (esValido) {
        await state.update({ dni: ctx.body })
        // Confirmar el turno.
        clearHistory(state)
        await flowDynamic('Listo! agendado. Gracias por elegirnos.')
    }
    else {
        return fallBack('Debe ingresar un DNI correcto')
    }
})

export { flowConfirm }
import { Message, ResponseChat, SaveChat } from "src/models/chat"
import { RequestResponse } from "src/models/response";

export type RespuestaDelChat = ResponseChat | ResponseChat[] | undefined

class AIClass {
    private uri: string
    constructor(_uri: string) {
        this.uri = _uri
    }

    createChat = async (messages: Message, uri?: string):Promise<string> => {
        try {
            const raw = JSON.stringify(messages)
            const myHeaders:Headers = new Headers()
            myHeaders.append("Content-Type", "application/json")
            myHeaders.append("Authorization", `Bearer ${process.env.TOKEN_AI}`)

            const requestOptions = { method: "POST", headers: myHeaders, body: raw }
            
            const fullUrl = `${process.env.AI_BASE_URL}${uri ? uri : ""}`
            const response = await fetch(fullUrl, requestOptions)
            const responseData = await response.json()
            const data: RequestResponse<string> = responseData
            if (data.success) {
                return data.result ?? ""
            }
            return "NOTHING"
        } catch (err) {
            console.error(err)
            return "ERROR"
        }
    };
    
    

    functionChat = async (messages: Message, uri?: string):Promise<RespuestaDelChat> => {
        let errorResp: ResponseChat = { exact: false, message: '' }
        try {
            const raw = JSON.stringify(messages)
            const myHeaders:Headers = new Headers()
            myHeaders.append("Content-Type", "application/json")
            myHeaders.append("Authorization", `Bearer ${process.env.TOKEN_AI}`)

            const requestOptions = { method: "POST", headers: myHeaders, body: raw }
            
            const fullUrl = `${process.env.AI_BASE_URL}${uri ? uri : ""}`
            const response = await fetch(fullUrl, requestOptions)
            const responseData = await response.json()
            const data: RequestResponse<RespuestaDelChat> = responseData
            if (data.success) {
                return data.result
            }
            errorResp.message = data.messages?.join(" ") ?? "Error en el servicio."
        } catch (err) {
            console.error(err)
            errorResp.message = "Error en recuperar fecha."
        }
        return errorResp
    };

    grabarTurno = async (save: SaveChat, uri?: string):Promise<boolean> => {
        try {
            const raw = JSON.stringify(save)
            const myHeaders:Headers = new Headers()
            myHeaders.append("Content-Type", "application/json")
            myHeaders.append("Authorization", `Bearer ${process.env.TOKEN_AI}`)

            const requestOptions = { method: "POST", headers: myHeaders, body: raw }
            
            const fullUrl = `${process.env.AI_BASE_URL}${uri ? uri : ""}`
            const response = await fetch(fullUrl, requestOptions)
            const responseData = await response.json()
            const data: RequestResponse<number> = responseData
            
            return data.success && data.result > 0
        } catch (err) {
            console.log("ERROR AL GRABAR EL TURNO.....")
            console.error(err)
        }
        return false
    };

}

export default AIClass;

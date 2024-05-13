import { Message, ResponseChat } from "src/models/chat"
import { RequestResponse } from "src/models/response";


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
                return data.result
            }
            return "NOTHING"
        } catch (err) {
            console.error(err)
            return "ERROR"
        }
    };

    functionChat = async (messages: Message, uri?: string):Promise<ResponseChat> => {
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
            const data: RequestResponse<ResponseChat> = responseData
            if (data.success) {
                return data.result
            }
            errorResp.message = data.messages?.join(" ")
        } catch (err) {
            console.error(err)
            errorResp.message = "Error en recuperar fecha"
        }
        return errorResp
    };

}

export default AIClass;

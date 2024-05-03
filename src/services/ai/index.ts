import { Message } from "src/models/chat"
import { RequestResponse } from "src/models/response";


class AIClass {
    private uri: string
    constructor(_uri: string) {
        this.uri = _uri
    }

    createChat = async (messages: Message, uri?: string) => {
        try {
            const raw = JSON.stringify(messages)
            const requestOptions = { method: "POST", headers: { "Content-Type": "application/json" }, body: raw }
            
            const response = await fetch(process.env.AI_BASE_URL, requestOptions)
            const data: RequestResponse<string> = await response.json()
            if (data.success) {

            }

            return data.result
        } catch (err) {
            console.error(err)
            return "ERROR"
        }
    };

}

export default AIClass;

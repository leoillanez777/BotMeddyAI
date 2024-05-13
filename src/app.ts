import 'dotenv/config'
import { createBot, MemoryDB, createProvider } from '@bot-whatsapp/bot'
import { BaileysProvider } from '@bot-whatsapp/provider-baileys'
import AIClass from './services/ai';
import flows from './flows';

const PORT = process.env.PORT ?? 3001
const ai = new AIClass('llama2:system', )

const main = async () => {

    const provider = createProvider(BaileysProvider)

    await createBot({
        database: new MemoryDB(),
        provider,
        flow: flows
    }, { extensions: { ai } })

    provider.initHttpServer(+PORT)
}

main()
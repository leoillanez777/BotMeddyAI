import 'dotenv/config'
import { createBot, MemoryDB, createProvider } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import AIClass from './services/ai';
import flows from './flows';

const PORT = process.env.PORT ?? 3001
const ai = new AIClass()

const main = async () => {

    const provider = createProvider(BaileysProvider)

    const { httpServer } = await createBot({
        database: new MemoryDB(),
        provider,
        flow: flows
    }, { extensions: { ai } })

    httpServer(+PORT)
}

main()
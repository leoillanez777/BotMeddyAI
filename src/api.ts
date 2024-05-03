import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys'

const initHttpServer = (provider: BaileysProvider) => {
  provider.initHttpServer(3002)
  provider.http.server.get('/send-message', (req, res) => {
    res.end('esto es del server de polka')
  })
  provider.http.server.post('/send-message', handleCtx(async (bot, req, res) => {
    const body = req.body
    console.log(body)
    //await bot.sendMessage(process.env.PHONE_NUMBER, 'Mensaje!', {})
  }))
}

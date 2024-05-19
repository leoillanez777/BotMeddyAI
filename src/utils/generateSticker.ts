import { join } from "path"
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

/**
 * Genera un mensaje de sticker basado en el nombre del archivo de imagen.
 * @param {string} fileName - El nombre del archivo de imagen.
 * @returns {Promise<{sticker: Buffer}>} - El mensaje de sticker.
 */
export async function generateStickerMessage(fileName:string):Promise<{sticker: Buffer}> {
  const pathGif = join(process.cwd(), "src", "assets", fileName)
  const sticker = new Sticker(pathGif, {
    pack: 'My Pack', // The pack name
    author: 'Me', // The author name
    type: StickerTypes.FULL, // The sticker type
    categories: ['👋'], // The sticker category
    id: Math.random().toString(36).slice(2, 9), // The sticker id
    quality: 50, // The quality of the output file
    background: '#000000' // The sticker background color (only for full stickers)
  })
  return await sticker.toMessage()
}
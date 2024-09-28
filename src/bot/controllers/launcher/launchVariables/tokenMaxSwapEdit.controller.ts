import Tokens from "@/models/Tokens"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your maximum swap (in %) </b>\n` + `This is the maximum amount of supply that can be bought in one transaction. \n` + `<i>(example: 0.5 or 1)</i>`, {
        parse_mode: 'HTML',
        reply_markup: {
            force_reply: true,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
}

export const textHandler = async (ctx: any) => {
    console.log('message::', ctx.message.text)
    const tokenMaxSwap = ctx.message.text || ''
    Tokens.create({maxSwap: tokenMaxSwap})
}

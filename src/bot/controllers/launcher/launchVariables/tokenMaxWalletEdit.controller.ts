import Tokens from "@/models/Tokens"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your maximum wallet (in %)  </b>\n` + `This is the maximum amount of supply that a wallet can own.  \n` + `<i>(example: 2 or 3)</i>`, {
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
    const tokenMaxWallet = ctx.message.text || ''
    Tokens.create({maxWallet: tokenMaxWallet})
}

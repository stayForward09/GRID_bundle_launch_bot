import Tokens from "@/models/Tokens"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your token name </b>\n` + `The name your token it will be known by.\n` + `<i>(example: Bitcoin or Ethereum)</i>`, {
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
    const tokenName = ctx.message.text || ''
    Tokens.create({name: tokenName})
}

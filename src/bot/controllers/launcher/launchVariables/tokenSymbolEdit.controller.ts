import Tokens from "@/models/Tokens"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your token symbol </b>\n` + `This is often a shortened version of your name.\n` + `<i>(example: ETH or BTC)</i>`, {
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
    const tokenSymbol = ctx.message.text || ''
    Tokens.create({symbol: tokenSymbol})
}

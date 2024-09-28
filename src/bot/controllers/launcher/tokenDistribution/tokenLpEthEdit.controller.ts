import Tokens from "@/models/Tokens"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter the amount of LP ETH  </b>\n` + `This is the amount of ETH you want your liquidity pool to start with. \n` + `<i>(example: 5 or 10)</i>`, {
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
    // const tokenName = ctx.message.text || ''
    // Tokens.create({name: tokenName})
}

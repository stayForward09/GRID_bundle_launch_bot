import Tokens from "@/models/Tokens"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter the total supply  </b>\n` + `This will be the permanent total supply, there is no burning yet nor do we allow minting. \n` + `<i>(example: 100,000,000)</i>`, {
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
    const tokenSupply = ctx.message.text || ''
    Tokens.create({supply: tokenSupply})
}

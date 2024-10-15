import { createWallets } from "."

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter the amount of wallets you want to create:</b>\n`, {
        parse_mode: 'HTML',
        reply_markup: {
            force_reply: true,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
}

export const textHandler = async (ctx: any) => {
    const _value = ctx.message.text
    const { id } = ctx.scene.state
    if (isNaN(_value)) {
        await ctx.reply(`Input must be a number.`)
    } else if (Number(_value) > 40) {
        await ctx.reply(`Maximum amount of wallets is 40.`)
    } 
    else {
        ctx.session.createWalletAmount = _value //or should store in db?
        await ctx.scene.leave()
        createWallets(ctx, id)
    }
}

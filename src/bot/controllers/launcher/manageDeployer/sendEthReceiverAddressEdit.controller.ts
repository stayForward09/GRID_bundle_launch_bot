import { isAddress } from 'ethers'
import { sendEth } from '.'

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter the address you want to send to:</b>\n`, {
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
    if (isAddress(_value)) {
        ctx.session.ethReceiveAddress = _value
        await ctx.scene.leave()
        sendEth(ctx, id)
    } else {
        await ctx.reply(`Address must be valid.`)
    }
}

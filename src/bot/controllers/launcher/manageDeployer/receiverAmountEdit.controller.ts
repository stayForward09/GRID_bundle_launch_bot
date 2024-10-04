import { isAddress } from 'ethers'
import { sendEth } from '.'

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter the amount of \${network.symbol} you want to send:</b>\n`, {
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
    } else {
        ctx.session.ethReceiverAmount = _value
        await ctx.scene.leave()
        sendEth(ctx, id)
    }
}

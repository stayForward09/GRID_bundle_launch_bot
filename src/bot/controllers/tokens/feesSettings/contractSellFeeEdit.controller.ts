import { deleteMessage } from '@/share/utils'
import { udpateFeesMenu } from '.'
import { checkExit, deleteOldMessages } from '@/share/utils'
import Tokens from '@/models/Tokens'

export const enterScene = async (ctx: any) => {
    deleteOldMessages(ctx)

    const { message_id } = await ctx.reply(`<b>Enter your sell fee</b>\n` + `The fee you take on all token buys. \n` + `<i>(example: 2 or 3)</i>`, {
        parse_mode: 'HTML',
        reply_markup: {
            force_reply: true,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
    ctx.session.message_id = message_id
}

export const textHandler = async (ctx: any) => {
    const check = await checkExit(ctx)
    if (check) return
    const _value = Number(ctx.message.text)
    const { id } = ctx.scene.state
    const { liquidityFee } = await Tokens.findOne({ _id: id })

    deleteMessage(ctx, ctx.session.message_id)
    deleteMessage(ctx, ctx.message.message_id)

    if (isNaN(_value)) {
        const { message_id } = await ctx.reply(`<b>Invalid Number</b> Sell Fee should be number (percent)` + `<i>(example: 2 or 3)</i>`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
        ctx.session.message_id = message_id
    } else if (_value >= 100 || _value < 0) {
        const { message_id } = await ctx.reply(`Sell Fee must be greater than 0 and less than 100.`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
        ctx.session.message_id = message_id
    } else if (_value + liquidityFee >= 100) {
        const { message_id } = await ctx.reply(`SellFee + LiquidityFee must be less than 100.`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
        ctx.session.message_id = message_id
    } else {
        await Tokens.findOneAndUpdate({ _id: id }, { sellFee: _value }, { new: true })
        await ctx.scene.leave()
        udpateFeesMenu(ctx, id)
    }
}
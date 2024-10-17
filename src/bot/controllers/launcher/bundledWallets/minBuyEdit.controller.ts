import Launches from '@/models/Launch'
import { bundled_wallets } from '.'

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your minimum wallet buy (in %) </b>\n` + `This is the minimum amount of supply a wallet will buy in the bundle. \n` + `<i>(example: 0.5 or 1)</i>`, {
        parse_mode: 'HTML',
        reply_markup: {
            force_reply: true,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
}

export const textHandler = async (ctx: any) => {
    const _value = Number(ctx.message.text)
    const { id } = ctx.scene.state
    const { maxSwap, maxBuy } = id.length > 1 ? await Launches.findById(id) : await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, {}, { new: true, upsert: true })
    if (isNaN(_value)) {
        ctx.reply(`<b>Invalid Number: </b> Min Wallet Buy must be a number.`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else if (_value > maxBuy || _value < 0) {
        ctx.reply(`Min wallet Buy must be greater than 0 and less than Max Wallet Buy.`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else {
        id.length > 1 ? await Launches.findOneAndUpdate({ _id: id }, { minBuy: _value }, { new: true }) : await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, { minBuy: _value }, { new: true, upsert: true })
        await ctx.scene.leave()
        bundled_wallets(ctx, id)
    }
}

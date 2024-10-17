import Launches from '@/models/Launch'
import { bundled_wallets } from '.'

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your maximum wallet buy (in %) </b>\n` + `This is the maximum amount of supply a wallet will buy in the bundle. \n` + `<i>(example: 1 or 2)</i>`, {
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
    const { maxSwap, minBuy } = id.length > 1 ? await Launches.findById(id) : await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, {}, { new: true, upsert: true })
    if (isNaN(_value)) {
        ctx.reply(`<b>Invalid Number: </b> Max Wallet Buy must be a number.`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else if (_value > 100 || _value < 0) {
        ctx.reply(`Max Wallet Buy must be greater than 0 and less than 100.`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else if (_value > Number(maxSwap)) {
        ctx.reply(`Current maxSwap is ${maxSwap}%. and Max Wallet Buy must be less than maxSwap.`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else if (_value < Number(minBuy)) {
        ctx.reply(`Max Wallet Buy must be greater than minBuy.`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else {
        id.length > 1 ? await Launches.findOneAndUpdate({ _id: id }, { maxBuy: _value }, { new: true }) : await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, { maxBuy: _value }, { new: true, upsert: true })
        await ctx.scene.leave()
        bundled_wallets(ctx, id)
    }
}

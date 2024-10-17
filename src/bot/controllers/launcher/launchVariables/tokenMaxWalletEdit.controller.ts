import Launches from '@/models/Launch'
import { launch_variables } from '@/bot/controllers/launcher/launchVariables/index'

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your maximum wallet (in %)  </b>\n` + `This is the maximum amount of supply that a wallet can own.  \n` + `<i>(example: 2 or 3)</i>`, {
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
    const { maxSwap } = id.length > 1 ? await Launches.findById(id) : await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, {}, { new: true, upsert: true })
    if (_value <= 0 || _value >= 100 || isNaN(_value)) {
        ctx.reply(`<b>Invalid Max Wallet</b> It should be between 0 and 100 (percent)` + `<i>(example: 1 or 5)</i>`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else if (_value < Number(maxSwap)) {
        ctx.reply(`<b>Invalid Max Wallet</b> Your maxSwap is ${maxSwap}%, and max wallet must be greater than maxSwap` + `<i>(example: 1 or 5)</i>`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else {
        id.length > 1 ? await Launches.findOneAndUpdate({ _id: id }, { maxWallet: _value }, { new: true }) : await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, { maxWallet: _value }, { new: true, upsert: true })
        await ctx.scene.leave()
        launch_variables(ctx, id)
    }
}

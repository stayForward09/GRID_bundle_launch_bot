import { fee_settings } from "."
import Launches from "@/models/Launch"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your sell fee</b>\n` + `The fee you take on all token buys. \n` + `<i>(example: 2 or 3)</i>`, {
        parse_mode: 'HTML',
        reply_markup: {
            force_reply: true,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
}

export const textHandler = async (ctx: any) => {
    const _value = Number(ctx.message.text);
    if (isNaN(_value)) {
        ctx.reply(`<b>Invalid Number</b> Sell Fee should be number (percent)` + `<i>(example: 2 or 3)</i>`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else if (_value > 100 || _value < 0) {
        ctx.reply(`Sell Fee must be greater than 0 and less than 100.`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else {
        await Launches.findOneAndUpdate(
            { userId: ctx.chat.id, enabled: false },
            { sellFee: _value },
            { new: true, upsert: true }
        );
        await ctx.scene.leave();
        fee_settings(ctx);
    }
}
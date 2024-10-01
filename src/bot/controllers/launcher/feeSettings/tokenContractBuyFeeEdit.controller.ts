import { fee_settings } from "."
import Launches from "@/models/Launch"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your buy fee</b>\n` + `The fee you take on all token buys. . \n` + `<i>(example: 2 or 3)</i>`, {
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
    const { id } = ctx.scene.state
    if (isNaN(_value)) {
        ctx.reply(`<b>Invalid Number</b> Buy Fee should be number (percent)` + `<i>(example: 2 or 3)</i>`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else if (_value > 100 || _value < 0) {
        ctx.reply(`Buy Fee must be greater than 0 and less than 100.`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else {
        id.length >  1 ? await Launches.findOneAndUpdate(
            { _id: id },
            { buyFee: _value },
            { new: true }
        ) : await Launches.findOneAndUpdate(
            { userId: ctx.chat.id, enabled: false },
            { buyFee: _value },
            { new: true, upsert: true }
        );
        await ctx.scene.leave();
        fee_settings(ctx, id);
    }
}

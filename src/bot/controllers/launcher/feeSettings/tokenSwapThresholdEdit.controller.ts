import { fee_settings } from "."
import Launches from "@/models/Launch"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your swap threshold (in %) </b>\n` + `This is the amount of supply that needs to be in the contract address before it will swap for ETH.\n` + `<i>(example: 5 or 10)</i>`, {
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
        ctx.reply(`<b>Invalid Number</b> Swap threshold should be number (percent)` + `<i>(example: 0.1 or 1)</i>`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else if (_value > 2 || _value < 0.001) {
        ctx.reply(`Swap Threshold must be greater than 0.001 and less than 2.`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else {
        id.length > 1 ? await Launches.findOneAndUpdate(
            { _id: id },
            { swapThreshold: _value },
            { new: true }
        ) : await Launches.findOneAndUpdate(
            { userId: ctx.chat.id, enabled: false },
            { swapThreshold: _value },
            { new: true, upsert: true }
        );
        await ctx.scene.leave();
        fee_settings(ctx, id);
    }
}

import { token_distribution } from "."
import Launches from "@/models/Launch"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter the amount of LP ETH  </b>\n` + `This is the amount of ETH you want your liquidity pool to start with. \n` + `<i>(example: 5 or 10)</i>`, {
        parse_mode: 'HTML',
        reply_markup: {
            force_reply: true,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
}

export const textHandler = async (ctx: any) => {
    const { id } = ctx.scene.state;
    const _value = Number(ctx.message.text);
    if (isNaN(_value)) {
        ctx.reply(`<b>Invalid Number</b> LP ETH should be number (percent)` + `<i>(example: 0.5 or 2)</i>`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else if (_value < 0) {
        ctx.reply(`LP supply must be greater than 0.001`, {
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
            { lpEth: _value },
            { new: true }
        ) : await Launches.findOneAndUpdate(
            { userId: ctx.chat.id, enabled: false },
            { lpEth: _value },
            { new: true, upsert: true }
        );
        await ctx.scene.leave();
        token_distribution(ctx, id);
    }
}


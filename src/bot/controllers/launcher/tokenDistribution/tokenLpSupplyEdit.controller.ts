import { token_distribution } from "."
import Launches from "@/models/Launch"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter the amount of LP Supply (in %) </b>\n` + `This is the amount of supply that you want to be in the liquidity pool. \n` + `<i>(example: 75 or 100)</i>`, {
        parse_mode: 'HTML',
        reply_markup: {
            force_reply: true,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
}

export const textHandler = async (ctx: any) => {
    const { id } = ctx.scene.state
    const { contractFunds } = id.length > 1 ? await Launches.findById(id) : await Launches.findOneAndUpdate(
        { userId: ctx.chat.id, enabled: false },
        {},
        { new: true, upsert: true }
    );
    console.log({ contractFunds })
    const _value = Number(ctx.message.text);
    if (isNaN(_value)) {
        ctx.reply(`<b>Invalid Number</b> LP supply should be number (percent)` + `<i>(example: 75 or 100)</i>`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else if (_value < 0) {
        ctx.reply(`LP supply must be greater than 0`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else if (_value + contractFunds > 100) {
        ctx.reply(`LP Supply + Contract Funds cannot be greater than 100.`, {
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
            { lpSupply: _value },
            { new: true }
        ) : await Launches.findOneAndUpdate(
            { userId: ctx.chat.id, enabled: false },
            { lpSupply: _value },
            { new: true, upsert: true }
        );
        await ctx.scene.leave();
        token_distribution(ctx, id);
    }
}

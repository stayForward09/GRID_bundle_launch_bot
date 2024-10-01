import { token_distribution } from "."
import Launches from "@/models/Launch"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter the amount of CA Funds (in %) </b>\n` + `This is the amount of supply that you want to be in the contract address. \n` + `<i>(example: 5 or 10)</i>`, {
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
    const { lpSupply } = id.length > 1 ? await Launches.findById(id) : await Launches.findOneAndUpdate(
        { userId: ctx.chat.id, enabled: false },
        {},
        { new: true, upsert: true }
    );
    console.log({ lpSupply })
    const _value = Number(ctx.message.text);
    if (isNaN(_value)) {
        ctx.reply(`<b>Invalid Number</b> It should be number (percent)` + `<i>(example: 1 or 5)</i>`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else if (_value > 25 || _value < 0) {
        ctx.reply(`CA Funds must be greater than 0 and less than 25.`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else if (_value + lpSupply > 100) {
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
            { _id : id },
            { contractFunds: _value },
            { new: true }
        ) : await Launches.findOneAndUpdate(
            { userId: ctx.chat.id, enabled: false },
            { contractFunds: _value },
            { new: true, upsert: true }
        );
        await ctx.scene.leave();
        token_distribution(ctx, id);
    }
}

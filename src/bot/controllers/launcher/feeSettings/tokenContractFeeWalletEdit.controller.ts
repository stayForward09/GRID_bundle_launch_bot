import { isAddress } from "ethers"
import { fee_settings } from "."
import Launches from "@/models/Launch"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your fee receiver address</b>\n` + `This is the address that will receive all fees.\n` + `<i>(default address will be the deployer)</i>`, {
        parse_mode: 'HTML',
        reply_markup: {
            force_reply: true,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
}

export const textHandler = async (ctx: any) => {
    const _value = ctx.message.text;
    if (isAddress(_value)) {
        await Launches.findOneAndUpdate(
            { userId: ctx.chat.id, enabled: false },
            { feeWallet: _value },
            { new: true, upsert: true }
        );
        await ctx.scene.leave();
        fee_settings(ctx);
    } else {
        await ctx.reply(`Invalid EVM address. Please retry`);
    }
}

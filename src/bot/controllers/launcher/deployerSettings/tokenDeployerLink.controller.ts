import { Wallet } from "ethers";
import { deployer_settings } from "."
import Launches from "@/models/Launch"

export const enterScene = async (ctx: any) => {
    const text =
        `<b>Enter the private key of the address you want to link as your deployer.</b>\n`;
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            force_reply: true,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
}
// text handler
export const textHandler = async (ctx: any) => {
    const _value = ctx.message.text;
    try {
        const { privateKey, address } = new Wallet(_value);
        console.log({ privateKey, address })
        await Launches.findOneAndUpdate(
            { userId: ctx.chat.id, enabled: false },
            {
                deployer: {
                    key: privateKey,
                    address
                }
            },
            { new: true, upsert: true }
        );
        ctx.scene.leave();
        deployer_settings(ctx);
    } catch (err) {
        ctx.reply(`Invalid Private key`);
        ctx.scene.leave();
    }
}

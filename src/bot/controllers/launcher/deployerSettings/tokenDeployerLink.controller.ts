import { Wallet } from "ethers";
import { deployer_settings } from "."
import Launches from "@/models/Launch"
import { encrypt } from "@/share/utils";

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
    const { id } = ctx.scene.state
    const _value = ctx.message.text;
    try {
        const { privateKey, address } = new Wallet(_value);
        console.log({ privateKey, address })
        id.length > 1 ? await Launches.findOneAndUpdate(
            { _id: id },
            {
                deployer: {
                    key: encrypt(privateKey),
                    address
                }
            },
            { new: true }
        ) : await Launches.findOneAndUpdate(
            { userId: ctx.chat.id, enabled: false },
            {
                deployer: {
                    key: encrypt(privateKey),
                    address
                }
            },
            { new: true, upsert: true }
        );
        ctx.scene.leave();
        deployer_settings(ctx, id);
    } catch (err) {
        ctx.reply(`Invalid Private key`);
        ctx.scene.leave();
    }
}

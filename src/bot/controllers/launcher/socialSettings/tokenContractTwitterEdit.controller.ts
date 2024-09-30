import { social_settings } from "."
import Launches from "@/models/Launch"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your X/Twitter URL</b>\n` + `<i>(example: https://twitter.com/ethdotorg)</i>`, {
        parse_mode: 'HTML',
        reply_markup: {
            force_reply: true,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
}

export const textHandler = async (ctx: any) => {
    await Launches.findOneAndUpdate(
        { userId: ctx.chat.id, enabled: false },
        { twitter: ctx.message.text },
        { new: true, upsert: true }
    );
    await ctx.scene.leave();
    social_settings(ctx);
}

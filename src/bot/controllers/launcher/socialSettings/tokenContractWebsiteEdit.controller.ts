import { social_settings } from "."
import Launches from "@/models/Launch"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your website URL</b>\n` + `<i>(example: https://ethereum.org)</i>`, {
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
    id.length > 1 ? await Launches.findOneAndUpdate(
        { _id: id },
        { website: ctx.message.text },
        { new: true }
    ) : await Launches.findOneAndUpdate(
        { userId: ctx.chat.id, enabled: false },
        { website: ctx.message.text },
        { new: true, upsert: true }
    );
    await ctx.scene.leave();
    social_settings(ctx, id);
}

import { social_settings } from "."
import Launches from "@/models/Launch"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter any custom text for the comment area of the contract</b>\n` + `<i>(example: This is the coolest project ever!)</i>`, {
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
        { custom: ctx.message.text },
        { new: true }
    ) : await Launches.findOneAndUpdate(
        { userId: ctx.chat.id, enabled: false },
        { custom: ctx.message.text },
        { new: true, upsert: true }
    );
    await ctx.scene.leave();
    social_settings(ctx, id);
}

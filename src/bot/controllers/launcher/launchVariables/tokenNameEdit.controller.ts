import Launches from "@/models/Launch"
import { launch_variables } from "@/bot/controllers/launcher/launchVariables/index"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your token name </b>\n` + `The name your token it will be known by.\n` + `<i>(example: Bitcoin or Ethereum)</i>`, {
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
        { name: ctx.message.text || '' },
        { new: true, upsert: true }
    );
    await ctx.scene.leave();
    launch_variables(ctx);
}

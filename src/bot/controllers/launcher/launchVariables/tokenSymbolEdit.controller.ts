import Launches from "@/models/Launch"
import { launch_variables } from "@/bot/controllers/launcher/launchVariables/index"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter your token symbol </b>\n` + `This is often a shortened version of your name.\n` + `<i>(example: ETH or BTC)</i>`, {
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
        { symbol: ctx.message.text || '' },
        { new: true }
    ) : await Launches.findOneAndUpdate(
        { userId: ctx.chat.id, enabled: false },
        { symbol: ctx.message.text || '' },
        { new: true, upsert: true }
    );
    await ctx.scene.leave();
    launch_variables(ctx, id);
}
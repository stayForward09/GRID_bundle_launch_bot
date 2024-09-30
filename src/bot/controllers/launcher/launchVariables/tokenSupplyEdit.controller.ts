import Launches from "@/models/Launch"
import { launch_variables } from "@/bot/controllers/launcher/launchVariables/index"

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter the total supply  </b>\n` + `This will be the permanent total supply, there is no burning yet nor do we allow minting. \n` + `<i>(example: 100,000,000)</i>`, {
        parse_mode: 'HTML',
        reply_markup: {
            force_reply: true,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
}

export const textHandler = async (ctx: any) => {
    const _value = Number(ctx.message.text);
    if (_value <= 0 || !Number.isInteger(_value)) {
        ctx.reply(`<b>Invalid total Supply</b> Pleaes retry with valid amount` + `<i>(example: 100,000,000)</i>`, {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        })
    } else {
        await Launches.findOneAndUpdate(
            { userId: ctx.chat.id, enabled: false },
            { totalSupply: _value },
            { new: true, upsert: true }
        );
        await ctx.scene.leave();
        launch_variables(ctx);
    }
}

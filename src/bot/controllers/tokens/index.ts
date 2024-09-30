import Launches from "@/models/Launch";
import Tokens from "@/models/Tokens";

export const menu = async (ctx: any) => {
    const _tokens = await Tokens.find({ userId: ctx.chat.id });
    const text =
        `<b>Manage Token</b>\nSelect a Token that you have launched.`;
    const tokens = [];
    for (let i = 0; i < _tokens.length; i += 2) {
        const element = (i + 1 >= Launches.length) ?
            [
                { text: _tokens[i].name, callback_data: `manage_token_${_tokens[i].id}` },
            ] :
            [
                { text: _tokens[i].name, callback_data: `manage_token_${_tokens[i].id}` },
                { text: _tokens[i + 1].name, callback_data: `manage_token_${_tokens[i + 1].id}` }
            ];
        tokens.push(element);
    }
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                ...tokens,
                [{ text: '⬅ back', callback_data: 'start' }]
            ],
            resize_keyboard: true
        }
    })
}
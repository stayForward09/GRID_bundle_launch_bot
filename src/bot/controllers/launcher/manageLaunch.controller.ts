import Launches from "@/models/Launch";

export const menu = async (ctx: any) => {

    const _launches = await Launches.find({ userId: ctx.chat.id, enabled: true });
    const text =
        `<b>Pending Launches</b>\n` +
        `Manage pending token launches..\n` +
        `Click on the respective Token Ticker that you wish to edit.`;

    const tokens = [];

    for (let i = 0; i < _launches.length; i += 2) {
        const element = (i + 1 >= _launches.length) ?
            [
                { text: _launches[i].name, callback_data: `edit_launch_${_launches[i].id}` },
            ] :
            [
                { text: _launches[i].name, callback_data: `edit_launch_${_launches[i].id}` },
                { text: _launches[i + 1].name, callback_data: `edit_launch_${_launches[i + 1].id}` }
            ];
        tokens.push(element);
    }

    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                ...tokens,
                [{ text: '⬅ back', callback_data: 'launcher' }]
            ],
            resize_keyboard: true
        }
    })
}
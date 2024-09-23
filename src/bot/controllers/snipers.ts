/**
 * tokens menu
 * @param ctx
 */
export const menu = async (ctx: any) => {
    const text = `<b>Snipers</b>\n` + `Select a token to manage snipers for.\n`

    // Send message with the import wallet button
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀 XXX token', callback_data: 'blablabla' }],
                [{ text: '⬅ back', callback_data: 'start' }]
            ],
            // eslint-disable-next-line prettier/prettier
            resize_keyboard: true
        },
        link_preview_options: {
            is_disabled: true
        }
    })
}
/**
 * tokens menu
 * @param ctx
 */
export const menu = async (ctx: any) => {
    const text = `<b>Deployers</b>\n` + `Select a token to manage deployers for.\n`

    
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀 Baby token', callback_data: 'blablabla' }],
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
/**
 * start
 * @param ctx
 */
export const start = async (ctx: any) => {
    const welcome = `Launch and bundle tokens effortlessly with OpenGRID. Streamlined for low-cost, high-performance token management. \n\n <a href='https://opengrid.tech'>Website</a> | <a href='https://opengrid.gitbook.io/opengrid-docs'>Documentation</a> | <a href='https://x.com/OpenGRID_ERC'>Twitter</a> | <a href='https://t.me/OpenGRID'>Telegram</a>`
    // Send message with the import wallet button
    await ctx.reply(welcome, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⚡ Launcher', callback_data: 'launcher' },
                    { text: '🌍 Tokens', callback_data: 'tokens' }
                ],
                [
                    { text: '🎯 Snipers', callback_data: 'snipers' },
                    { text: '🚀 Deployers', callback_data: 'deployers' }
                ],
                [{ text: '👥 Referrals', callback_data: 'referrals' }]
            ],
            resize_keyboard: true
        },
        link_preview_options: {
            is_disabled: true
        }
    })
}

/**
 * tokens menu
 * @param ctx
 */
export const menu = async (ctx: any) => {
    const text = `<b>Referrals</b>\n` + `Get started by creating a referral code.\n`

    
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [[{ text: '🚀 Create Referral', callback_data: 'create_referral' }], [{ text: '⬅ back', callback_data: 'start' }]],
            resize_keyboard: true
        },
        link_preview_options: {
            is_disabled: true
        }
    })
}
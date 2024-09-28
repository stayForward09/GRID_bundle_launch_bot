import { setup_wizard } from './createLaunch.controller'

/**
 * launch menu
 * @param ctx
 */
export const menu = async (ctx: any) => {
    ctx.session.bundled_snipers = false
    ctx.session.instant_launch = false
    ctx.session.auto_lp = false
    ctx.session.token_max_swap = 0
    ctx.session.token_max_wallet = 0
    ctx.session.token_blacklist_capability = false
    const text =
        `Launcher\n` +
        `Would you like to Create or Manage a token launch?\n` +
        `<b>Create Launch</b> – Start a new undefined token launch.\n` +
        `<b>Manage Launch</b> – Set your launch parameters before deployment..\n` +
        `<b>Launch Token</b> – Deploy a new token on the undefined Network.\n`

    
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '➕ Create Launch', callback_data: 'create_launch' },
                    { text: '⚖ Manage Launch', callback_data: 'manage_launch' }
                ],
                [{ text: '🚀 Launch Token', callback_data: 'launch_token' }],
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

export const handleSetupWizard = async (ctx: any) => {
    ctx.session[ctx.session.currentSelectType] = !ctx.session[ctx.session.currentSelectType]
    setup_wizard(ctx)
}

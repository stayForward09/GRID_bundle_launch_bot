import { handleSetupWizard, menu as launcher } from './launcher'
import { create_launch, setup_wizard } from './launcher/createLaunch.controller'
import { fee_settings } from './launcher/feeSettings'
import { launch_variables } from './launcher/launchVariables'
import { token_distribution } from './launcher/tokenDistribution'

/**
 * start
 * @param ctx
 */
export const start = async (ctx: any) => {
    const welcome = `Launch and bundle tokens effortlessly with OpenGRID. Streamlined for low-cost, high-performance token management. \n\n <a href='https://opengrid.tech'>Website</a> | <a href='https://opengrid.gitbook.io/opengrid-docs'>Documentation</a> | <a href='https://x.com/OpenGRID_ERC'>Twitter</a> | <a href='https://t.me/OpenGRID'>Telegram</a>`
    
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

export const callbackQuery = async (ctx: any) => {
    const selectedOption: string = ctx.callbackQuery.data
    if (selectedOption == 'launcher') {
        launcher(ctx)
    } else if (selectedOption == 'create_launch') {
        create_launch(ctx)
    } else if (selectedOption == 'setup_wizard') {
        setup_wizard(ctx)
    } else if (selectedOption == 'bundled_snipers' || selectedOption == 'instant_launch' || selectedOption == 'auto_lp' || selectedOption == 'blacklist_capability') {
        ctx.session.currentSelectType = selectedOption
        handleSetupWizard(ctx)
    } else if (selectedOption == 'launch_variables') {
        launch_variables(ctx)
    } else if (selectedOption.slice(0, 5) == 'token' && selectedOption.slice(-5) == 'Scene') {
        ctx.scene.enter(selectedOption)
    } else if (selectedOption == 'token_distribution') {
        token_distribution(ctx)
    } else if (selectedOption == 'fee_settings') {
        fee_settings(ctx)
    }
}

import Launches from '@/models/Launch'
import { handleSetupWizard, menu as launcher, menu } from './launcher'
import { create_launch, setup_wizard } from './launcher/createLaunch.controller'
import { deployer_settings } from './launcher/deployerSettings'
import { fee_settings } from './launcher/feeSettings'
import { social_settings } from './launcher/socialSettings'
import { token_distribution } from './launcher/tokenDistribution'
import { previewLaunch, tokenLaunch } from './launcher/launchToken.controller'

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

    if (selectedOption == 'setup_wizard') {
        await Launches.deleteMany({ userId: ctx.chat.id, enabled: false });
        setup_wizard(ctx)
    } else if (selectedOption == 'bundledSnipers' || selectedOption == 'instantLaunch' || selectedOption == 'autoLP' || selectedOption == 'blacklistCapability') {
        handleSetupWizard(ctx, selectedOption)
    } else if (selectedOption.slice(0, 5) == 'token' && selectedOption.slice(-5) == 'Scene') {
        ctx.scene.enter(selectedOption)
    } else if (selectedOption === 'create_launch_confirm') {
        const { deployer } = await Launches.findOne({ userId: ctx.chat.id, enabled: false });
        if (!deployer?.address) {
            ctx.reply(`Please connect deployer`)
        } else {
            await Launches.findOneAndUpdate(
                { userId: ctx.chat.id, enabled: false },
                { enabled: true },
                { new: true, upsert: true }
            );
            menu(ctx);
        }
    } else if (selectedOption.startsWith('launch_preview_')) {
        previewLaunch(ctx, selectedOption.split("_")[2]);
    } else if (selectedOption.startsWith('launch_token_')) {
        tokenLaunch(ctx, selectedOption.split("_")[2]);
    }
}

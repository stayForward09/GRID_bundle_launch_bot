import Launches from '@/models/Launch'
import { handleSetupWizard, menu as launcher, menu } from './launcher'
import { create_launch, launch_settings } from './launcher/createLaunch.controller'
import { deployer_settings } from './launcher/deployerSettings'
import { fee_settings } from './launcher/feeSettings'
import { social_settings } from './launcher/socialSettings'
import { token_distribution } from './launcher/tokenDistribution'
import { previewLaunch, tokenLaunch } from './launcher/launchToken.controller'
import { contractVerification, generalSettings, detail as tokenDetail } from './tokens'
import { deleteLaunch, manageLaunchDetails } from './launcher/manageLaunch.controller'
import { launch_variables } from './launcher/launchVariables'
import { estimateDeploymentCost, manageDeployer, sendEth, sendEthConfirm } from './launcher/manageDeployer'

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
        await Launches.deleteMany({ userId: ctx.chat.id, enabled: false })
        launch_settings(ctx)
    } else if (selectedOption.startsWith('bundledSnipers_') || selectedOption.startsWith('instantLaunch_') || selectedOption.startsWith('autoLP_') || selectedOption.startsWith('blacklistCapability_')) {
        handleSetupWizard(ctx, selectedOption.split('_')[0], selectedOption.split('_')[1])
    } else if (selectedOption.startsWith('scene_')) {
        const [_, sceneName, id] = selectedOption.split('_')
        ctx.scene.enter(sceneName, { id: id })
    } else if (selectedOption.startsWith('create_launch_confirm_')) {
        const id = selectedOption.split('_')[3]
        const { deployer } = id.length > 1 ? await Launches.findById(id) : await Launches.findOne({ userId: ctx.chat.id, enabled: false })
        if (!deployer?.address) {
            ctx.reply(`Please connect deployer`)
        } else {
            if (id.length > 1) {
                manageLaunchDetails(ctx, id)
            } else {
                await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, { enabled: true }, { new: true, upsert: true })
                menu(ctx)
            }
        }
    } else if (selectedOption.startsWith('launch_preview_')) {
        previewLaunch(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('launch_token_')) {
        tokenLaunch(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('manage_token_')) {
        tokenDetail(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('general_settings_')) {
        generalSettings(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('verify_contract_')) {
        contractVerification(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('manage_launch_')) {
        manageLaunchDetails(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('edit_launch_')) {
        launch_settings(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('launch_variables_')) {
        launch_variables(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('token_distribution_')) {
        token_distribution(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('fee_settings_')) {
        fee_settings(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('social_settings_')) {
        social_settings(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('deployer_settings_')) {
        deployer_settings(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('delete_launch_')) {
        deleteLaunch(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('deleteLaunch_confirm_')) {
        const id = selectedOption.split("_")[2]
        await Launches.deleteOne({ _id: id })
        launcher(ctx)
    } else if (selectedOption.startsWith('manage_deployer_')) {
        manageDeployer(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('send_eth_')) {
        sendEth(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('sendEth_confirm_')) {
        sendEthConfirm(ctx, selectedOption.split('_')[2])
    } else if (selectedOption.startsWith('estimate_DeploymentCost_')) {
        estimateDeploymentCost(ctx, selectedOption.split('_')[2])
    }
}

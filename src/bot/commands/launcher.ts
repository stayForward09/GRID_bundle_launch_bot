import { menu } from '@/bot/controllers/launcher'
import { create_launch } from '../controllers/launcher/createLaunch.controller'
import { launch_variables } from '@/bot/controllers/launcher/launchVariables'
import { token_distribution } from '../controllers/launcher/tokenDistribution'
import { fee_settings } from '../controllers/launcher/feeSettings'
import { social_settings } from '../controllers/launcher/socialSettings'
import { deployer_settings } from '../controllers/launcher/deployerSettings'
import { menu as menuManageLaunch } from '../controllers/launcher/manageLaunch.controller'
import { menu as menuLaunchToken } from '../controllers/launcher/launchToken.controller'

export default (_bot: any) => {
    _bot.action('launcher', menu)
    _bot.command('launcher', menu)

    _bot.action('fee_settings', fee_settings)
    _bot.action('create_launch', create_launch)
    _bot.action('manage_launch', menuManageLaunch)
    _bot.action('social_settings', social_settings)
    _bot.action('launch_variables', launch_variables)
    _bot.action('deployer_settings', deployer_settings)
    _bot.action('token_distribution', token_distribution)
    _bot.action('launch_token', menuLaunchToken)
}

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

    _bot.action('launch_token', menuLaunchToken)
    _bot.action('create_launch', create_launch)
    _bot.action('manage_launch', menuManageLaunch)
}

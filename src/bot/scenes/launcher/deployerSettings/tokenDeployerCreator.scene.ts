import { Scenes, Context } from 'telegraf'
import { enterScene, callbackQuery } from '../../../controllers/launcher/deployerSettings/tokenDeployerCreate.controller'

export const tokenDeployerCreatorScene = new Scenes.BaseScene<Context>('tokenDeployerCreatorScene')

tokenDeployerCreatorScene.enter(enterScene)
tokenDeployerCreatorScene.on('callback_query', callbackQuery)
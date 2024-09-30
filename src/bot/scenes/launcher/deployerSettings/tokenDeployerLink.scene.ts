import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/deployerSettings/tokenDeployerLink.controller'

export const tokenDeployerLinkScene = new Scenes.BaseScene<Context>('tokenDeployerLinkScene')

tokenDeployerLinkScene.enter(enterScene)
tokenDeployerLinkScene.on('text', textHandler)
import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/launchVariables/tokenMaxWalletEdit.controller'

export const tokenMaxWalletEditorScene = new Scenes.BaseScene<Context>('tokenMaxWalletEditorScene')

tokenMaxWalletEditorScene.enter(enterScene)
tokenMaxWalletEditorScene.on('text', textHandler)
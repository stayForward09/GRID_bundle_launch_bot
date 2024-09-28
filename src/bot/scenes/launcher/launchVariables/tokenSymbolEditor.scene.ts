import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/launchVariables/tokenSymbolEdit.controller'

export const tokenSymbolEditorScene = new Scenes.BaseScene<Context>('tokenSymbolEditorScene')

tokenSymbolEditorScene.enter(enterScene)
tokenSymbolEditorScene.on('text', textHandler)
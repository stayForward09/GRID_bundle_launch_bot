import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/launchVariables/tokenMaxSwapEdit.controller'

export const tokenMaxSwapEditorScene = new Scenes.BaseScene<Context>('tokenMaxSwapEditorScene')

tokenMaxSwapEditorScene.enter(enterScene)
tokenMaxSwapEditorScene.on('text', textHandler)
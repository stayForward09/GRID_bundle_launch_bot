import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/launchVariables/tokenSupplyEdit.controller'

export const tokenSupplyEditorScene = new Scenes.BaseScene<Context>('tokenSupplyEditorScene')

tokenSupplyEditorScene.enter(enterScene)
tokenSupplyEditorScene.on('text', textHandler)
import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/launchVariables/tokenNameEdit.controller'

export const tokenNameEditorScene = new Scenes.BaseScene<Context>('tokenNameEditorScene')

tokenNameEditorScene.enter(enterScene)
tokenNameEditorScene.on('text', textHandler)
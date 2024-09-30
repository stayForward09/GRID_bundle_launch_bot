import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/socialSettings/tokenContractCustomEdit.controller'

export const tokenCustomEditorScene = new Scenes.BaseScene<Context>('tokenCustomEditorScene')

tokenCustomEditorScene.enter(enterScene)
tokenCustomEditorScene.on('text', textHandler)
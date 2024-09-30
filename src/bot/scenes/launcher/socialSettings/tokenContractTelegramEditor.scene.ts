import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/socialSettings/tokenContractTelegramEdit.controller'

export const tokenTelegramEditorScene = new Scenes.BaseScene<Context>('tokenTelegramEditorScene')

tokenTelegramEditorScene.enter(enterScene)
tokenTelegramEditorScene.on('text', textHandler)
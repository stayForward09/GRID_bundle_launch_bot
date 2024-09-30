import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/socialSettings/tokenContractWebsiteEdit.controller'

export const tokenWebsiteEditorScene = new Scenes.BaseScene<Context>('tokenWebsiteEditorScene')

tokenWebsiteEditorScene.enter(enterScene)
tokenWebsiteEditorScene.on('text', textHandler)
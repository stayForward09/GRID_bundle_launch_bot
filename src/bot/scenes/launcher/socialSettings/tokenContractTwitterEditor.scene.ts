import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/socialSettings/tokenContractTwitterEdit.controller'

export const tokenTwitterEditorScene = new Scenes.BaseScene<Context>('tokenTwitterEditorScene')

tokenTwitterEditorScene.enter(enterScene)
tokenTwitterEditorScene.on('text', textHandler)
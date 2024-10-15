import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/bundledWallets/maxBuyEdit.controller'

export const maxBuyEditorScene = new Scenes.BaseScene<Context>('maxBuyEditorScene')

maxBuyEditorScene.enter(enterScene)
maxBuyEditorScene.on('text', textHandler)
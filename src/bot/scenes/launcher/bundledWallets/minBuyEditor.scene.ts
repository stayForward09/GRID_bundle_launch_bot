import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/bundledWallets/minBuyEdit.controller'

export const minBuyEditorScene = new Scenes.BaseScene<Context>('minBuyEditorScene')

minBuyEditorScene.enter(enterScene)
minBuyEditorScene.on('text', textHandler)
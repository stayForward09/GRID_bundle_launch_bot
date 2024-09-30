import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/feeSettings/tokenSwapThresholdEdit.controller'

export const tokenSwapThresholdEditorScene = new Scenes.BaseScene<Context>('tokenSwapThresholdEditorScene')

tokenSwapThresholdEditorScene.enter(enterScene)
tokenSwapThresholdEditorScene.on('text', textHandler)
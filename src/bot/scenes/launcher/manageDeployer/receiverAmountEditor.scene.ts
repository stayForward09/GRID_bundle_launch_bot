import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/manageDeployer/receiverAmountEdit.controller'

export const receiverAmountEditorScene = new Scenes.BaseScene<Context>('receiverAmountEditorScene')

receiverAmountEditorScene.enter(enterScene)
receiverAmountEditorScene.on('text', textHandler)
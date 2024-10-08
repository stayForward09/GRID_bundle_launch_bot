import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/manageDeployer/sendEthReceiverAddressEdit.controller'

export const sendEthReceiverAddressEditorScene = new Scenes.BaseScene<Context>('sendEthReceiverAddressEditorScene')

sendEthReceiverAddressEditorScene.enter(enterScene)
sendEthReceiverAddressEditorScene.on('text', textHandler)
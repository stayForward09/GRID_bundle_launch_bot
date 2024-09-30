import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/feeSettings/tokenContractFeeWalletEdit.controller'

export const tokenFeeWalletEditorScene = new Scenes.BaseScene<Context>('tokenFeeWalletEditorScene')

tokenFeeWalletEditorScene.enter(enterScene)
tokenFeeWalletEditorScene.on('text', textHandler)
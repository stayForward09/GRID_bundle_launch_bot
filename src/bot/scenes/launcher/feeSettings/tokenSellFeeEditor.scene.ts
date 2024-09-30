import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/feeSettings/tokenContractSellFeeEdit.controller'

export const tokenSellFeeEditorScene = new Scenes.BaseScene<Context>('tokenSellFeeEditorScene')

tokenSellFeeEditorScene.enter(enterScene)
tokenSellFeeEditorScene.on('text', textHandler)
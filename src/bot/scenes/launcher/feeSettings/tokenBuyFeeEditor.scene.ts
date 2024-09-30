import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/feeSettings/tokenContractBuyFeeEdit.controller'

export const tokenBuyFeeEditorScene = new Scenes.BaseScene<Context>('tokenBuyFeeEditorScene')

tokenBuyFeeEditorScene.enter(enterScene)
tokenBuyFeeEditorScene.on('text', textHandler)
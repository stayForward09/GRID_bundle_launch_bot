import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/feeSettings/tokenContractLiquidityFeeEdit.controller'

export const tokenLiquidityFeeEditorScene = new Scenes.BaseScene<Context>('tokenLiquidityFeeEditorScene')

tokenLiquidityFeeEditorScene.enter(enterScene)
tokenLiquidityFeeEditorScene.on('text', textHandler)
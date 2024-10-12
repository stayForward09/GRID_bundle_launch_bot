import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/manageWallets/createWalletAmountEdit.controller'

export const createWalletAmountScene = new Scenes.BaseScene<Context>('createWalletAmountScene')

createWalletAmountScene.enter(enterScene)
createWalletAmountScene.on('text', textHandler)
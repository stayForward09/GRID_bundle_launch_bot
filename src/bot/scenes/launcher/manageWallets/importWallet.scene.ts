import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/manageWallets/importWalletEdit.controller'

export const importWalletScene = new Scenes.BaseScene<Context>('importWalletScene')

importWalletScene.enter(enterScene)
importWalletScene.on('text', textHandler)
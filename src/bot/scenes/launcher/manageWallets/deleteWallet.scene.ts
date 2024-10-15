import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/manageWallets/deleteWalletEdit.controller'

export const deleteWalletScene = new Scenes.BaseScene<Context>('deleteWalletScene')

deleteWalletScene.enter(enterScene)
deleteWalletScene.on('text', textHandler)
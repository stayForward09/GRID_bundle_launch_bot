import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/tokenDistribution/tokenContractFundsEdit.controller'

export const tokenContractFundsEditorScene = new Scenes.BaseScene<Context>('tokenContractFundsEditorScene')

tokenContractFundsEditorScene.enter(enterScene)
tokenContractFundsEditorScene.on('text', textHandler)
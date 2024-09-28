import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/tokenDistribution/tokenLpEthEdit.controller'

export const tokenLpEthEditorScene = new Scenes.BaseScene<Context>('tokenLpEthEditorScene')

tokenLpEthEditorScene.enter(enterScene)
tokenLpEthEditorScene.on('text', textHandler)
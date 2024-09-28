import { Scenes, Context } from 'telegraf'
import { enterScene, textHandler } from '../../../controllers/launcher/tokenDistribution/tokenLpSupplyEdit.controller'

export const tokenLpSupplyEditorScene = new Scenes.BaseScene<Context>('tokenLpSupplyEditorScene')

tokenLpSupplyEditorScene.enter(enterScene)
tokenLpSupplyEditorScene.on('text', textHandler)
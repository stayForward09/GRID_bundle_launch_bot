import { menu } from '@/bot/controllers/launcher'
import { create_launch } from '../controllers/launcher/createLaunch.controller'

export default (_bot: any) => {
    /**
     * @command /launcher
     * launcher menu function
     */
    _bot.command('launcher', menu)
}

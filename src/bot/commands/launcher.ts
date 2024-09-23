import { menu } from '@/bot/controllers/launcher'

export default (_bot: any) => {
    /**
     * @command /launcher
     * launcher menu function
     */
    _bot.command('launcher', menu)
    /**
     * @action start
     * start function
     */
    _bot.action('launcher', menu)
}

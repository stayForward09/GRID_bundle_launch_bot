import { menu } from '@/bot/controllers/tokens'

export default (_bot: any) => {
    /**
     * @command /tokens
     * launcher menu function
     */
    _bot.command('tokens', menu)
    /**
     * @action start
     * start function
     */
    _bot.action('tokens', menu)
}

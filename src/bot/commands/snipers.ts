import { menu } from '@/bot/controllers/snipers'

export default (_bot: any) => {
    /**
     * @command /snipers
     * snipers menu function
     */
    _bot.command('snipers', menu)
    /**
     * @action snipers
     * snipers menu function
     */
    _bot.action('snipers', menu)
}

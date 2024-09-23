import { start } from '@/bot/controllers/main'
import { Update } from '@telegraf/types'
import { Context, Telegraf } from 'telegraf'

export default (_bot: Telegraf<Context<Update>>) => {
    /**
     * @command /start
     * start function
     */
    _bot.command('start', start)
    /**
     * @action start
     * start function
     */
    _bot.action('start', start)

    /**
     * @actoin /launcher
     * launcher function
     */
    _bot.action('launcher', async (ctx: any) => {
        const text =
            `Launcher\n` +
            `Would you like to Create or Manage a token launch?\n` +
            `<b>Create Launch</b> – Start a new undefined token launch.\n` +
            `<b>Manage Launch</b> – Set your launch parameters before deployment..\n` +
            `<b>Launch Token</b> – Deploy a new token on the undefined Network.\n`

        // Send message with the import wallet button
        ctx.reply(text, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '➕ Create Launch', callback_data: 'create_launch' },
                        { text: '⚖ Manage Launch', callback_data: 'manage_launch' }
                    ],
                    [{ text: '🚀 Launch Token', callback_data: 'launch_token' }],
                    [{ text: '⬅ back', callback_data: 'start' }]
                ],
                // eslint-disable-next-line prettier/prettier
                resize_keyboard: true
            },
            link_preview_options: {
                is_disabled: true
            }
        })
    })
}

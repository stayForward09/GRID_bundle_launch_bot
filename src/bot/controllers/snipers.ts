import Launches from '@/models/Launch'

/**
 * tokens menu
 * @param ctx
 */
export const menu = async (ctx: any) => {
    ctx.session.tagTitle = 'snipers'
    const text = `<b>Snipers</b>\n` + `Select a token to manage snipers for.\n`

    const _launches = await Launches.find({ userId: ctx.chat.id, enabled: true })

    const tokens = []

    for (let i = 0; i < _launches.length; i += 2) {
        const element =
            i + 1 >= _launches.length
                ? [{ text: _launches[i].name, callback_data: `manage_wallets_${_launches[i].id}` }]
                : [
                      { text: _launches[i].name, callback_data: `manage_wallets_${_launches[i].id}` },
                      { text: _launches[i + 1].name, callback_data: `manage_wallets_${_launches[i + 1].id}` }
                  ]
        tokens.push(element)
    }

    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [...tokens, [{ text: '← back', callback_data: 'start' }]],
            resize_keyboard: true
        }
    })
}

import Launches from '@/models/Launch'

export const create_launch = async (ctx: any) => {
    const text =
        `<b>Launch Type Selection</b>\n` +
        `Select the type of Launch you would like to create.\n` +
        `<b>Setup Wizard</b> –  Create a new token launch with our easy-to-use interface.\n` +
        `<b>Custom Contract (Beta) </b> – Upload your own token contract to be used for your launch.\n`

    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🧨 Setup Wizard', callback_data: 'setup_wizard' },
                    { text: '✨ Custom Contract (Beta) ', callback_data: 'custom_contract' }
                ],
                [{ text: '✖ cancel', callback_data: 'launcher' }]
            ],
            // eslint-disable-next-line prettier/prettier
            resize_keyboard: true
        },
        link_preview_options: {
            is_disabled: true
        }
    })
}

export const launch_settings = async (ctx: any, id: string = '') => {
    const launch = id.length > 1 ? await Launches.findById(id) : await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, {}, { new: true, upsert: true })
    const text =
        `<b>Launch Creation in Progress…</b>\n` +
        `Choose any optional features you would like enabled with this launch.\n\n` +
        `<b>Bundled Snipers </b> –  Launch your token in a bundled transaction with buy transactions to Bolster Liquidity and Secure Team Tokens on the market.\n` +
        `<b>Instant Launch </b> – From Deployment to Liquidity to Trading, enable it all in one to perform a true Stealth Launch.\n` +
        `<b>Automatic LP </b> – During Deployment, immediately Initialize the Liquidity Pool without Enabling Trading.\n`

    const inlineKeyboard =
        id.length > 1
            ? [
                  [{ text: '➡ Next ', callback_data: `launch_variables_${launch.id}` }],
                  [{ text: '===== LAUNCH SETTINGS =====', callback_data: '#' }],
                  [
                      { text: `${launch.bundledSnipers ? '🟢' : '🔴'} Bundled Snipers`, callback_data: `bundledSnipers_${launch.id}` },
                      { text: `${launch.instantLaunch ? '🟢' : '🔴'} Instant Launch`, callback_data: `instantLaunch_${launch.id}` }
                  ],
                  [{ text: `${launch.autoLP ? '🟢' : '🔴'} Auto LP`, callback_data: `autoLP_${launch.id}` }],
                  [
                      { text: '✖ Cancel', callback_data: `manage_launch_${launch.id}`},
                      { text: '✔️ Save ', callback_data: `manage_launch_${launch.id}` }
                  ]
              ]
            : [
                  [
                      { text: '✖ Cancel', callback_data: 'create_launch' },
                      { text: '➡ Next ', callback_data: 'launch_variables_' }
                  ],
                  [{ text: '===== LAUNCH SETTINGS =====', callback_data: '#' }],
                  [
                      { text: `${launch.bundledSnipers ? '🟢' : '🔴'} Bundled Snipers`, callback_data: 'bundledSnipers_' },
                      { text: `${launch.instantLaunch ? '🟢' : '🔴'} Instant Launch`, callback_data: 'instantLaunch_' }
                  ],
                  [{ text: `${launch.autoLP ? '🟢' : '🔴'} Auto LP`, callback_data: 'autoLP_' }]
              ]

    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: inlineKeyboard,
            // eslint-disable-next-line prettier/prettier
            resize_keyboard: true
        },
        link_preview_options: {
            is_disabled: true
        }
    })
}

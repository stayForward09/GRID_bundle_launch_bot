import Launches from "@/models/Launch"

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

export const setup_wizard = async (ctx: any) => {
    const launch = await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, {}, { new: true, upsert: true });
    const text =
        `<b>Launch Creation in Progress…</b>\n` +
        `Choose any optional features you would like enabled with this launch.\n\n` +
        `<b>Bundled Snipers </b> –  Launch your token in a bundled transaction with buy transactions to Bolster Liquidity and Secure Team Tokens on the market.\n` +
        `<b>Instant Launch </b> – From Deployment to Liquidity to Trading, enable it all in one to perform a true Stealth Launch.\n` +
        `<b>Automatic LP </b> – During Deployment, immediately Initialize the Liquidity Pool without Enabling Trading.\n`


    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '✖ Cancel', callback_data: 'create_launch' },
                    { text: '➡ Next ', callback_data: 'launch_variables' }
                ],
                [{ text: '===== LAUNCH SETTINGS =====', callback_data: '#' }],
                [
                    { text: `${launch.bundledSnipers ? '🟢' : '🔴'} Bundled Snipers`, callback_data: 'bundledSnipers' },
                    { text: `${launch.instantLaunch ? '🟢' : '🔴'} Instant Launch`, callback_data: 'instantLaunch' }
                ],
                [{ text: `${launch.autoLP ? '🟢' : '🔴'} Auto LP`, callback_data: 'autoLP' }]
            ],
            // eslint-disable-next-line prettier/prettier
            resize_keyboard: true
        },
        link_preview_options: {
            is_disabled: true
        }
    })
}


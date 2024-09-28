export const launch_variables = async (ctx: any) => {
    const token_max_swap = ctx.session.token_max_swap
    const token_max_wallet = ctx.session.token_max_wallet
    const blacklist_capability = ctx.session.blacklist_capability === true
    const text =
        `<b>Launch Creation in Progress…</b>\n` +
        `Fill in the required launch parameters for your token.\n\n` +
        `<b>Name </b> –  The Full Name of your ERC-20 token.\n` +
        `<b>Symbol </b> – The Ticker of your ERC-20 token.\n` +
        `<b>Max Buy </b> – The largest amount of tokens that can be purchased in a single transaction.\n` +
        `<b>Max Wallet </b> – The largest number of tokens that can be held in a single wallet.\n`

    
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⬅ Back', callback_data: 'setup_wizard' },
                    { text: '➡ Next ', callback_data: 'token_distribution' }
                ],
                [{ text: '===== LAUNCH VARIABLES =====', callback_data: '#' }],
                [
                    { text: '✏ Name', callback_data: 'tokenNameEditorScene' },
                    { text: '💲 Symbol', callback_data: 'tokenSymbolEditorScene' }
                ],
                [{ text: '🗳 Supply', callback_data: 'tokenSupplyEditorScene' }],
                [
                    { text: `${token_max_swap ? '🟢' : '🔴'} Max Swap`, callback_data: 'tokenMaxSwapEditorScene' },
                    { text: `${token_max_wallet ? '🟢' : '🔴'} Max Wallet`, callback_data: 'tokenMaxWalletEditorScene' }
                ],
                [{ text: `${blacklist_capability ? '🟢' : '🔴'} Blacklist Capability`, callback_data: 'blacklist_capability' }]
            ],
            // eslint-disable-next-line prettier/prettier
            resize_keyboard: true
        },
        link_preview_options: {
            is_disabled: true
        }
    })
}
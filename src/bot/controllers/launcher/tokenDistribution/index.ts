export const token_distribution = async (ctx: any) => {
    const text =
        `<b>Launch Creation in Progress…</b>\n` +
        `Set your Initial Liquidity below.\n` +
        `This will determine the Initial Price for your token.\n\n` +
        `<b>LP Tokens </b> –  The amount of your token that you would like to deposit into the Initial Liquidity Pool.\n` +
        `<b>LP ETH  </b> – The amount of ETH that will be added to the Initial Liquidity Pool.\n` +
        `<b>Contract Funds </b> – Tokens that will be minted directly into the contract's wallet. These will be used for tax.\n` +
        `<b>Anti-Drain </b> – A system that attempts to prevent the contract funds from being drained by malicious bots.\n`

    
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⬅ Back', callback_data: 'launch_variables' },
                    { text: '➡ Next ', callback_data: 'fee_settings' }
                ],
                [{ text: '===== TOKEN DISTRIBUTION =====', callback_data: '#' }],
                [
                    { text: '📦 LP Supply', callback_data: 'tokenLpSupplyEditorScene' },
                    { text: '🥢 LP ETH', callback_data: 'tokenLpEthEditorScene' }
                ],
                [{ text: '💳 Contract Funds', callback_data: 'tokenContractFundsEditorScene' }]
            ],
            // eslint-disable-next-line prettier/prettier
            resize_keyboard: true
        },
        link_preview_options: {
            is_disabled: true
        }
    })
}
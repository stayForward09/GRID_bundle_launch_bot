import Launches from "@/models/Launch";

/**
 * Launch Varaible Settings
 * @param ctx 
 */
export const launch_variables = async (ctx: any) => {
    const {
        name,
        symbol,
        totalSupply,
        maxSwap,
        maxWallet,
        blacklistCapability
    } = await Launches.findOneAndUpdate(
        { userId: ctx.chat.id, enabled: false },
        {},
        { new: true, upsert: true }
    );

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
                    { text: `✏ ${name}`, callback_data: 'tokenNameEditorScene' },
                    { text: `💲 ${symbol}`, callback_data: 'tokenSymbolEditorScene' }
                ],
                [{ text: `🗳 ${Intl.NumberFormat().format(totalSupply)}`, callback_data: 'tokenSupplyEditorScene' }],
                [
                    { text: `${maxSwap ? '🟢' : '🔴'} Max Swap ${maxSwap}%`, callback_data: 'tokenMaxSwapEditorScene' },
                    { text: `${maxWallet ? '🟢' : '🔴'} Max Wallet ${maxWallet}%`, callback_data: 'tokenMaxWalletEditorScene' }
                ],
                [{ text: `${blacklistCapability ? '🟢' : '🔴'} Blacklist Capability`, callback_data: 'blacklistCapability' }]
            ],
            // eslint-disable-next-line prettier/prettier
            resize_keyboard: true
        },
        link_preview_options: {
            is_disabled: true
        }
    })
}
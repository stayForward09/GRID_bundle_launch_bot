import Launches from '@/models/Launch'

/**
 * Launch Varaible Settings
 * @param ctx
 */
export const launch_variables = async (ctx: any, id: string = '') => {
    const { name, symbol, totalSupply, maxSwap, maxWallet, blacklistCapability } = id.length > 1 ? await Launches.findById(id) : await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, {}, { new: true, upsert: true })

    const text =
        `<b>Launch Creation in Progress…</b>\n` +
        `Fill in the required launch parameters for your token.\n\n` +
        `<b>Name </b> –  The Full Name of your ERC-20 token.\n` +
        `<b>Symbol </b> – The Ticker of your ERC-20 token.\n` +
        `<b>Max Buy </b> – The largest amount of tokens that can be purchased in a single transaction.\n` +
        `<b>Max Wallet </b> – The largest number of tokens that can be held in a single wallet.\n`

    const inlineKeyboard =
        id.length > 1
            ? [
                  [
                      { text: '⬅ Back', callback_data: `edit_launch_${id}` },
                      { text: '➡ Next ', callback_data: `token_distribution_${id}` }
                  ],
                  [{ text: '===== LAUNCH VARIABLES =====', callback_data: '#' }],
                  [
                      { text: `✏ ${name}`, callback_data: `scene_tokenNameEditorScene_${id}` },
                      { text: `💲 ${symbol}`, callback_data: `scene_tokenSymbolEditorScene_${id}` }
                  ],
                  [{ text: `🗳 ${Intl.NumberFormat().format(totalSupply)}`, callback_data: `scene_tokenSupplyEditorScene_${id}` }],
                  [
                      { text: `${maxSwap ? '🟢' : '🔴'} Max Swap ${maxSwap}%`, callback_data: `scene_tokenMaxSwapEditorScene_${id}` },
                      { text: `${maxWallet ? '🟢' : '🔴'} Max Wallet ${maxWallet}%`, callback_data: `scene_tokenMaxWalletEditorScene_${id}` }
                  ],
                  [{ text: `${blacklistCapability ? '🟢' : '🔴'} Blacklist Capability`, callback_data: `blacklistCapability_${id}` }],
                  [
                      { text: '✖ Cancel', callback_data: `manage_launch_${id}` },
                      { text: '✔️ Save ', callback_data: `manage_launch_${id}` }
                  ]
              ]
            : [
                  [
                      { text: '⬅ Back', callback_data: 'setup_wizard' },
                      { text: '➡ Next ', callback_data: 'token_distribution_' }
                  ],
                  [{ text: '===== LAUNCH VARIABLES =====', callback_data: '#' }],
                  [
                      { text: `✏ ${name}`, callback_data: 'scene_tokenNameEditorScene_' },
                      { text: `💲 ${symbol}`, callback_data: 'scene_tokenSymbolEditorScene_' }
                  ],
                  [{ text: `🗳 ${Intl.NumberFormat().format(totalSupply)}`, callback_data: 'scene_tokenSupplyEditorScene_' }],
                  [
                      { text: `${maxSwap ? '🟢' : '🔴'} Max Swap ${maxSwap}%`, callback_data: 'scene_tokenMaxSwapEditorScene_' },
                      { text: `${maxWallet ? '🟢' : '🔴'} Max Wallet ${maxWallet}%`, callback_data: 'scene_tokenMaxWalletEditorScene_' }
                  ],
                  [{ text: `${blacklistCapability ? '🟢' : '🔴'} Blacklist Capability`, callback_data: 'blacklistCapability_' }]
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

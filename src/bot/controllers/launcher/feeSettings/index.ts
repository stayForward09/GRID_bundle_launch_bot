import Launches from '@/models/Launch'

export const fee_settings = async (ctx: any, id: string = '') => {
    const { buyFee, sellFee, liquidityFee, swapThreshold, feeWallet } = id.length > 1 ? await Launches.findById(id) : await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, {}, { new: true, upsert: true })

    const text =
        `<b>Launch Creation in Progress…</b>\n` +
        `If you wish to have a tax on your token, fill in the fields below. \n\n` +
        `Buy Fee+Liquidity Fee=Total Buy Fee \n` +
        `Sell Fee+Liquidity Fee=Total Sell Fee \n\n` +
        `<b>Buy Fee </b> – The tax on Buy transactions.\n` +
        `<b>Sell Fee  </b> – The tax on Sell transactions.\n` +
        `<b>Liquidity Fee </b> – The tax that is added to the Liquidity Pool.\n` +
        `<b>Swap Threshold </b> – The amount of tokens that must be in the contract before a swap can occur.\n`

    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⬅ Back', callback_data: `token_distribution_${id}` },
                    { text: '➡ Next ', callback_data: `social_settings_${id}` }
                ],
                [{ text: '===== FEE SETTINGS =====', callback_data: '#' }],

                [{ text: `Fee Wallet: ${feeWallet}`, callback_data: `scene_tokenFeeWalletEditorScene_${id}` }],
                [
                    { text: `${buyFee ? '🟢' : '🔴'} Buy Fee ${buyFee}%`, callback_data: `scene_tokenBuyFeeEditorScene_${id}` },
                    { text: `${sellFee ? '🟢' : '🔴'} Sell Fee ${sellFee}%`, callback_data: `scene_tokenSellFeeEditorScene_${id}` }
                ],
                [{ text: `${liquidityFee ? '🟢' : '🔴'} Liquidity Fee ${liquidityFee}$`, callback_data: `scene_tokenLiquidityFeeEditorScene_${id}` }],
                buyFee > 0 || sellFee > 0 ? [{ text: `⚖ Swap Threshold ${swapThreshold}%`, callback_data: `scene_tokenSwapThresholdEditorScene_${id}` }] : [],
                id.length > 1
                    ? [
                          { text: '✖ Cancel', callback_data: `manage_launch_${id}` },
                          { text: '✔️ Save ', callback_data: `manage_launch_${id}` }
                      ]
                    : []
            ],
            // eslint-disable-next-line prettier/prettier
            resize_keyboard: true
        },
        link_preview_options: {
            is_disabled: true
        }
    })
}

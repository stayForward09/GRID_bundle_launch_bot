import Launches from '@/models/Launch'

export const bundled_wallets = async (ctx: any, id: string = '') => {
    const { minBuy, maxBuy, bundledWallets } = id.length > 1 ? await Launches.findById(id) : await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, {}, { new: true, upsert: true })

    const text =
        `<b>Bundled Wallets</b>\n` +
        `Setup your Bundled Wallets and prepare them for Launch. \n` +
        `Ensure that all ETH amounts are correct and are able to cover at least the MAX BUY to guarantee a smooth launch. \n\n` +
        `<b>Bundled Wallets </b> – Set the number of Bundled Wallets that you wish to use in your Bundled Launch.\n` +
        `<b>Max Buy </b> – This is the maximum amount of tokens that the Wallets will be able to buy. (This cannot exceed your Max Buy from the Launch Parameters.)\n` +
        `<b>Min Buy </b> – This is the minimum amount of tokens that the Wallets will be able to buy.\n`

    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '===== BUNDLED WALLETS =====', callback_data: '#' }],
                [{ text: `💼 Bundled Wallets [${bundledWallets.length}]`, callback_data: `manage_wallets_${id}` }],
                [
                    { text: `🔼 Max Buy: ${maxBuy}%`, callback_data: `scene_maxBuyEditorScene_${id}` },
                    { text: `🔽 Min Buy: ${minBuy}%`, callback_data: `scene_minBuyEditorScene_${id}` }
                ],
                [{ text: '======', callback_data: '#' }],
                id.length > 1
                    ? [{ text: '← Back', callback_data: `deployer_settings_${id}` }]
                    : [
                          { text: '← Back', callback_data: `deployer_settings_${id}` },
                          { text: '✔ Create', callback_data: `create_launch_confirm_${id}` }
                      ],
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

import Launches from "@/models/Launch";

/**
 * Launch Varaible Settings
 * @param ctx 
 */
export const social_settings = async (ctx: any) => {
    const {
        website,
        twitter,
        telegram,
        custom
    } = await Launches.findOneAndUpdate(
        { userId: ctx.chat.id, enabled: false },
        {},
        { new: true, upsert: true }
    );

    const text =
        `<b>Launch Creation in Progress…</b>\n` +
        `If you wish for your socials to be present at the top of your contract fill them in here.\n\n` +
        `<b>Website </b> – Your website URL.\n` +
        `<b>X/Twitter </b> – Your X/Twitter profile URL.\n` +
        `<b>Telegram </b> – The Telegram chat/portal of your project.\n` +
        `<b>Custom </b> – This is any additional text you want in the comment box.\n` +
        `It will be added after that last social link. You can also use this instead of the socials.`;


    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⬅ Back', callback_data: 'fee_settings' },
                    { text: '➡ Next ', callback_data: 'deployer_settings' }
                ],
                [{ text: '===== SOCIAL SETTINGS =====', callback_data: '#' }],
                [
                    { text: `🌐 Website: ${website}`, callback_data: 'tokenWebsiteEditorScene' },
                    { text: `✖ X/Twitter: ${twitter}`, callback_data: 'tokenTwitterEditorScene' }
                ],
                [
                    { text: `🗨 Telegram: ${telegram}`, callback_data: 'tokenTelegramEditorScene' },
                    { text: `✏ Custom: ${custom}`, callback_data: 'tokenCustomEditorScene' }
                ],
            ],
            // eslint-disable-next-line prettier/prettier
            resize_keyboard: true
        },
        link_preview_options: {
            is_disabled: true
        }
    })
}
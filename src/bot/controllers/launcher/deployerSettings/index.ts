import Launches from "@/models/Launch";

export const deployer_settings = async (ctx: any) => {

    const { deployer } = await Launches.findOneAndUpdate(
        { userId: ctx.chat.id, enabled: false },
        {},
        { new: true, upsert: true }
    );

    const text =
        `<b>Deployer Settings</b>\n` +
        `Create or Link a Deployer Address to be used with GRID. \n\n` +
        `Deployer Address: <code>${deployer?.address ?? "Unset"}</code> \n\n` +
        `<b>Create Deployer </b> – Make a new Deployer Address that will be automatically linked with your GRID. All relevant/private information will be provided to you upon Creation.\n` +
        `<b>Link Deployer  </b> – Connect an existing Wallet Address to be used as the Deployer in your BOT.\n`;

    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⬅ Back', callback_data: 'social_settings' },
                    { text: '✔ Create', callback_data: 'create_launch_confirm' }
                ],
                [{ text: '===== DEPLOYER SETTINGS =====', callback_data: '#' }],
                [
                    { text: `✍ Create Deployer`, callback_data: 'tokenDeployerCreatorScene' },
                    { text: `🔗 Link Deployer`, callback_data: 'tokenDeployerLinkScene' }
                ]
            ],
            // eslint-disable-next-line prettier/prettier
            resize_keyboard: true
        },
        link_preview_options: {
            is_disabled: true
        }
    })
}
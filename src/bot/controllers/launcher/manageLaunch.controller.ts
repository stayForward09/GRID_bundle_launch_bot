import Launches from '@/models/Launch'

export const menu = async (ctx: any) => {
    const _launches = await Launches.find({ userId: ctx.chat.id, enabled: true })
    const text = `<b>Pending Launches</b>\n` + `Manage pending token launches..\n` + `Click on the respective Token Ticker that you wish to edit.`

    const tokens = []

    for (let i = 0; i < _launches.length; i += 2) {
        const element =
            i + 1 >= _launches.length
                ? [{ text: _launches[i].name, callback_data: `manage_launch_${_launches[i].id}` }]
                : [
                      { text: _launches[i].name, callback_data: `manage_launch_${_launches[i].id}` },
                      { text: _launches[i + 1].name, callback_data: `manage_launch_${_launches[i + 1].id}` }
                  ]
        tokens.push(element)
    }

    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [...tokens, [{ text: '⬅ back', callback_data: 'launcher' }]],
            resize_keyboard: true
        }
    })
}

export const manageLaunchDetails = async (ctx: any, id: string) => {
    const launch = await Launches.findById(id)
    if (!launch) {
        ctx.reply(`⚠ There is no launch for this. Please check again`)
        return
    }
    const text =
        `<b>Launch Features </b>[$${launch.symbol}]\n` +
        `Edit any existing launches including their Parameters, Snipers, and Deployer, or Delete the launch altogether.\n\n` +
        `<b>Edit Launch </b> – Change any details in relation to the contract and your token launch. (Includes LP, Supply, Tax, etc.)\n` +
        `<b>Delete Launch </b> – Remove the launch from your Launch List. This will erase all previously added Snipers and Parameters.\n` +
        `<b>Manage Snipers </b> – Add, Remove, and Fund any Snipers that will be used in your Bundled Launch.\n` +
        `<b>Manage Deployer </b> – Add, Remove, or Edit your Deployer Address for the current Launch.\n`

    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '✏️ Edit Launch', callback_data: `edit_launch_${launch.id}` },
                    { text: '❌ Delete Launch ', callback_data: `delete_launch_${launch.id}` }
                ],
                [
                    { text: '🎯 Manage Snipers', callback_data: `manage_snipers_${launch.id}` },
                    { text: '👑 Manage Deployer', callback_data: `manage_deployer_${launch.id}` }
                ],
                [{ text: '⬅️ Back', callback_data: 'manage_launch' }]
            ],
            // eslint-disable-next-line prettier/prettier
            resize_keyboard: true
        },
        link_preview_options: {
            is_disabled: true
        }
    })
}

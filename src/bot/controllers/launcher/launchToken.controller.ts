import Launches from "@/models/Launch";

export const menu = async (ctx: any) => {
    const _launches = await Launches.find({ userId: ctx.chat.id, enabled: true });
    const text =
        `<b>Select a Launch:</b>\n`;
    const tokens = [];
    for (let i = 0; i < _launches.length; i += 2) {
        const element = (i + 1 >= Launches.length) ?
            [
                { text: _launches[i].name, callback_data: `launch_preview_${_launches[i].id}` },
            ] :
            [
                { text: _launches[i].name, callback_data: `launch_preview_${_launches[i].id}` },
                { text: _launches[i + 1].name, callback_data: `launch_preview_${_launches[i + 1].id}` }
            ];
        tokens.push(element);
    }
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                ...tokens,
                [{ text: '⬅ back', callback_data: 'launcher' }]
            ],
            resize_keyboard: true
        }
    })
}
/**
 * preview launch
 * @param ctx 
 * @param id 
 */
export const previewLaunch = async (ctx: any, id: string) => {
    const launch = await Launches.findById(id);
    if (launch) {
        const text =
            `<b>Are you sure you want to launch</b> <code>${launch.name}</code>?\n` +
            `<u>Since you do no have any token fees, a flat liquidity fee of</u> <code>${launch.lpEth} ETH</code> <u>will be charged directly from the deployer.</u>\n\n` +
            `<b>Please ensure the following parameters are correct:</b>\n` +
            `<i>Token Name:</i> ${launch.name}\n` +
            `<i>Symbol:</i> ${launch.symbol}\n` +
            `<i>Token Supply:</i> ${Intl.NumberFormat().format(launch.totalSupply)}\n` +
            `<i>Buy Tax:</i> ${launch.buyFee}\n` +
            `<i>Sell Tax:</i> ${launch.sellFee}\n` +
            `<i>Liquidity Tax:</i> ${launch.liquidityFee}\n` +
            `<i>Max Wallet:</i> ${launch.maxWallet}\n` +
            `<i>Max Swap:</i> ${launch.maxSwap}\n` +
            `<i>Fee Wallet:</i> ${launch.feeWallet}\n`;
        ctx.reply(text, {
            parse_mode: 'HTML',
            reply_markup: {
                one_time_keyboard: true,
                resize_keyboard: true,
                inline_keyboard: [
                    [
                        { text: 'Cancel', callback_data: `launch_token` },
                        { text: 'Confirm', callback_data: `launch_token_${id}` }
                    ]
                ],
            }
        })
    } else {
        ctx.reply('no launch')
    }
}
/**
 * token launch
 * @param ctx 
 * @param id 
 */
export const tokenLaunch = async (ctx: any, id: string) => {
    const launch = await Launches.findById(id);
    if (launch) {
        const text =
            `<b>Are you sure you want to launch</b> <code>${launch.name}</code>?\n` +
            `<u>Since you do no have any token fees, a flat liquidity fee of</u> <code>${launch.lpEth} ETH</code> <u>will be charged directly from the deployer.</u>\n\n` +
            `<b>Please ensure the following parameters are correct:</b>\n` +
            `<i>Token Name:</i> ${launch.name}\n` +
            `<i>Symbol:</i> ${launch.symbol}\n` +
            `<i>Token Supply:</i> ${Intl.NumberFormat().format(launch.totalSupply)}\n` +
            `<i>Buy Tax:</i> ${launch.buyFee}\n` +
            `<i>Sell Tax:</i> ${launch.sellFee}\n` +
            `<i>Liquidity Tax:</i> ${launch.liquidityFee}\n` +
            `<i>Max Wallet:</i> ${launch.maxWallet}\n` +
            `<i>Max Swap:</i> ${launch.maxSwap}\n` +
            `<i>Fee Wallet:</i> ${launch.feeWallet}\n`;

        ctx.reply(text, {
            parse_mode: 'HTML',
            reply_markup: {
                one_time_keyboard: true,
                resize_keyboard: true,
                inline_keyboard: [
                    [
                        { text: 'Cancel', callback_data: `launcher` },
                        { text: 'Confirm', callback_data: `launch_token_${id}` }
                    ]
                ],
            }
        })
    } else {
        ctx.reply('no launch')
    }
}
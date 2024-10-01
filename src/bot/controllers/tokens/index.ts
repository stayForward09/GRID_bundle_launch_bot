import { CHAIN_INFO } from "@/config/constant";
import Tokens from "@/models/Tokens";
import axios from 'axios';
import solc from 'solc';

export const menu = async (ctx: any) => {
    const _tokens = await Tokens.find({ userId: ctx.chat.id });
    const text =
        `<b>Manage Token</b>\nSelect a Token that you have launched.`;
    const tokens = [];
    for (let i = 0; i < _tokens.length; i += 2) {
        const element = (i + 1 >= _tokens.length) ?
            [
                { text: _tokens[i].name, callback_data: `manage_token_${_tokens[i].id}` },
            ] :
            [
                { text: _tokens[i].name, callback_data: `manage_token_${_tokens[i].id}` },
                { text: _tokens[i + 1].name, callback_data: `manage_token_${_tokens[i + 1].id}` }
            ];
        tokens.push(element);
    }
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                ...tokens,
                [{ text: '⬅ back', callback_data: 'start' }]
            ],
            resize_keyboard: true
        }
    })
}

export const detail = async (ctx: any, id: string) => {
    const _token = await Tokens.findById(id);
    if (!_token) {
        return ctx.reply('⚠ There is no token for this id')
    }
    const text =
        `<b>Managing</b> <code>$${_token.symbol}</code>\n` +
        `Here you are able to interact with all aspects of your Launch.\n` +
        `Please check out the docs for more detailed explanations of the functions.\n\n` +
        `Contract Address:\n` +
        `<code>${_token.address}</code>\n` +
        `<b>General Settings</b> - Overall contract functionality, perform tasks such as Verifying your Contract.\n` +
        `<b>Limits Settings</b> - Change the Limits that are imposed on the Swaps for your contract, Disable All Limits, Holding Limits, and Swap Limits.\n` +
        `<b>Fees Settings</b> - Change the Fees that are taken on Swap transactions and the Threshold that your Tax will be sold.\n` +
        `<b>Ownership Settings</b> - All functions that are related to the Ownership of the contract, choose to either Renounce the Contract or Transfer Ownership.\n` +
        `<b>Safety Functions</b> - If any funds are stuck in the contract, Transfer Stuck ETH and Transfer Stuck Tokens are available through this menu.\n` +
        `<b>Liquidity Management</b> - Add or Remove Liquidity from your contract.\n`;

    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '⚙ General Settings', callback_data: `general_settings_${id}` }],
                [{ text: '➖ Limits Settings', callback_data: `limits_settings_${id}` }, { text: '💲 Fees Settings', callback_data: `fees_settings_${id}` }],
                [{ text: '🔑 Ownership Settings', callback_data: `ownership_settings_${id}` }, { text: '🧱 Safety Functions', callback_data: `safty_functions_${id}` }],
                [{ text: '💦 Liquidity Management', callback_data: `lp_management_${id}` }],
                [{ text: '👈 Back', callback_data: `tokens` }],
            ],
            resize_keyboard: true
        }
    })
}

export const generalSettings = async (ctx: any, id: string) => {
    const _token = await Tokens.findById(id);
    if (!_token) {
        return ctx.reply('⚠ There is no token for this id')
    }
    const text =
        `<b>General Settings</b>\n` +
        `Use this menu to call basic contract function included with ${_token.symbol}.\n\n` +
        `<b>Verify Contract</b> - This will verify the source code of your contract on the Blockchain.\n` +
        `<b>Enable Trading</b> - This will allow users to Swap your Token. If this option is available, your Token is not currently tradable.\n`;

    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🏁 Enable Trading', callback_data: `enable_trading_${id}` }, { text: '🌺 Verify Contract', callback_data: `verify_contract_${id}` }],
                [{ text: '👈 Back', callback_data: `manage_token_${id}` }],
            ],
            resize_keyboard: true
        }
    })
}

export const contractVerification = async (ctx: any, id: string) => {
    const _token = await Tokens.findById(id);
    if (!_token) {
        ctx.reply('⚠ There is no token for this id')
    } else if (_token.verified) {
        ctx.reply(`Contract already verified on <a href='${CHAIN_INFO.explorer}/address/${_token.address}'>EtherscanOrg</a>`)
    } else {
        ctx.reply('🕐 Verifying Contract...');

        try {
            const symbol = _token.symbol.replace(/\s/g, '');
            const name = _token.name;

            console.log(`contracts/${symbol}.sol:${symbol}`)

            const data = await axios.post(`https://api.basescan.org/api?module=contract&action=verifysourcecode&apikey=${process.env.ETHERSCAN_API_KEY}`,
                {
                    // apikey: process.env.ETHERSCAN_API_KEY,
                    // module: 'contract',
                    // action: 'verifysourcecode',

                    codeformat: "solidity-single-file",
                    sourceCode: _token.sourceCode,
                    contractaddress: _token.address,
                    contractname: symbol,
                    compilerversion: 'v0.8.19+commit.7dd6d404',
                    optimizationUsed: 1,
                    runs: 200,
                },
                {
                    headers: {
                        'Content-Type': "application/x-www-form-urlencoded"
                    }
                }
            );

            console.log(data.data)
        } catch (err) {
            console.log(err)
        }

        // ctx.reply(text, {
        //     parse_mode: 'HTML',
        //     reply_markup: {
        //         inline_keyboard: [
        //             [{ text: '🏁 Enable Trading', callback_data: `enable_trading_${id}` }, { text: '🌺 Verify Contract', callback_data: `verify_contract_${id}` }],
        //             [{ text: '👈 Back', callback_data: `manage_token_${id}` }],
        //         ],
        //         resize_keyboard: true
        //     }
        // })
    }

}
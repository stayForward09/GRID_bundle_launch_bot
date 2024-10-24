import { Markup } from 'telegraf'
import { CHAINS, CHAIN_ID } from '@/config/constant'
import { verifyContract } from '@/share/utils'
import Tokens from '@/models/Tokens'

export const menu = async (ctx: any) => {
    const _tokens = await Tokens.find({ userId: ctx.chat.id })
    const text = `<b>Manage Token</b>\nSelect a Token that you have launched.`
    const tokens = []
    for (let i = 0; i < _tokens.length; i += 2) {
        const element =
            i + 1 >= _tokens.length
                ? [{ text: _tokens[i].name, callback_data: `manage_token_${_tokens[i].id}` }]
                : [
                      { text: _tokens[i].name, callback_data: `manage_token_${_tokens[i].id}` },
                      { text: _tokens[i + 1].name, callback_data: `manage_token_${_tokens[i + 1].id}` }
                  ]
        tokens.push(element)
    }
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [...tokens, [{ text: '← back', callback_data: 'start' }]],
            resize_keyboard: true
        }
    })
}

/**
 * controller token detail page
 * @param ctx
 * @param id
 * @returns
 */
export const detail = async (ctx: any, id: string) => {
    const _token = await Tokens.findById(id)
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
        `<b>Liquidity Management</b> - Add or Remove Liquidity from your contract.\n`

    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '⚙ General Settings', callback_data: `general_settings_${id}` }],
                [
                    { text: '➖ Limits Settings', callback_data: `limits_settings_${id}` },
                    { text: '💲 Fees Settings', callback_data: `fees_settings_${id}` }
                ],
                [
                    { text: '🔑 Ownership Settings', callback_data: `ownership_settings_${id}` },
                    { text: '🧱 Safety Functions', callback_data: `safty_functions_${id}` }
                ],
                [{ text: '💦 Liquidity Management', callback_data: `lp_management_${id}` }],
                [{ text: '👈 Back', callback_data: `tokens` }]
            ],
            resize_keyboard: true
        }
    })
}

/**
 * controller for general settings
 * @param ctx
 * @param id
 * @returns
 */
export const generalSettings = async (ctx: any, id: string) => {
    const _token = await Tokens.findById(id)
    if (!_token) {
        return ctx.reply('⚠ There is no token for this id')
    }
    const text =
        `<b>General Settings</b>\n` +
        `Use this menu to call basic contract function included with ${_token.symbol}.\n\n` +
        `<b>Verify Contract</b> - This will verify the source code of your contract on the Blockchain.\n` +
        `<b>Enable Trading</b> - This will allow users to Swap your Token. If this option is available, your Token is not currently tradable.\n`

    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🏁 Enable Trading', callback_data: `enable_trading_${id}` },
                    { text: '🌺 Verify Contract', callback_data: `verify_contract_${id}` }
                ],
                [{ text: '👈 Back', callback_data: `manage_token_${id}` }]
            ],
            resize_keyboard: true
        }
    })
}

/**
 * controller for contract verification
 * @param ctx
 * @param id
 */
export const contractVerification = async (ctx: any, id: string) => {
    const CHAIN = CHAINS[CHAIN_ID]
    const _token = await Tokens.findById(id)
    if (!_token) {
        ctx.reply('⚠ There is no token for this id')
    } else if (_token.verified) {
        ctx.reply(`Contract already verified on <a href='${CHAIN.explorer}/address/${_token.address}'>EtherscanOrg</a>`)
    } else {
        ctx.reply('🕐 Verifying Contract...')
        const symbol = _token.symbol.replace(/\s/g, '')
        const name = _token.name
        const chainId = CHAIN_ID
        const { status, message } = await verifyContract(_token.address, _token.sourceCode, symbol, chainId)

        if (status === 'success') {
            ctx.reply(`🌺 <code>${_token.symbol}</code> has been verified successfully on Etherscan\nAddress: <code>${_token.address}</code>`, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[Markup.button.url(`👁 View Here`, `${CHAIN.explorer}/address/${_token.address}`)], [{ text: '👈 Back', callback_data: `manage_token_${id}` }]],
                    resize_keyboard: true
                }
            })
        } else {
            ctx.reply(`💬 ${message}`)
        }
    }
}

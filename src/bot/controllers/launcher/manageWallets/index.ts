import { CHAIN_INFO } from '@/config/constant'
import Launches from '@/models/Launch'
import { encrypt } from '@/share/utils'
import { ethers, JsonRpcProvider, Wallet } from 'ethers'
import fs from 'fs'

export const manageWallets = async (ctx: any, id: string) => {
    const launch = await Launches.findById(id)
    const provider = new JsonRpcProvider(CHAIN_INFO.RPC)
    const walletAddress = ''
    // Get the balance in wei
    // const balanceWei = await provider.getBalance(walletAddress)
    // Convert wei to ether
    // const balanceEth = ethers.formatEther(balanceWei)
    const text =
        `*Bundled Wallets*\n` +
        `Create\\, Import\\, and Delete Wallets that will be used with your WAGYU launch\\. \n` +
        `_Funds can be added to Wallets at a later stage\\._ \n\n` +
        `*__Wallets will only save when the “Back” button is pressed\\.__* \n\n` +
        `*Create Wallet * –   Add a new address to your Bundled Wallets\\. Please remember to save the private key when it is provided\\.\n` +
        `*Import Wallet * – Import an existing address to your Bundled Wallets\\. You will need your Private Key for importing\\. \n` +
        `*Delete Wallet * – Delete an address from your Bundled Wallets\\. \n\n` +
        `*Send ETH * – Select a Wallet and Transfer its ETH to another Address\\. \n` +
        `*Wallets Disperse List * – Request a \\.txt file of the required amounts for your Wallet operation\\. \n\n` +
        `*Total Required * – 0\\.9298 ETH \n\n` +
        `Wallet: \`${walletAddress}\`\n` +
        `Balance: \`${0} ETH \`\n`
    ctx.replyWithMarkdownV2(text, {
        reply_markup: {
            one_time_keyboard: true,
            inline_keyboard: [
                [{ text: '⬅️ Back', callback_data: `manage_launch_${id}` }],
                [
                    { text: '✔️ Create Wallet(s) ', callback_data: `manage_createWallets_${id}` },
                    { text: '🔗 Import Wallet(s) ', callback_data: `manage_importWallets_${id}` },
                    { text: '✖️ Delete Wallet(s) ', callback_data: `manage_deleteWallets_${id}` }
                ],
                [
                    { text: '📜 Wallet Disperse List ', callback_data: `manage_walletDisperse_${id}` },
                    { text: '📤 Send ETH ', callback_data: `manage_sendEth_${id}` }
                ],
                [{ text: '🗑 Empty All Wallets', callback_data: `manage_emptyWallets_${id}` }]
            ],
            // eslint-disable-next-line prettier/prettier
            resize_keyboard: true
        }
    })
}

export const createWallets = async (ctx: any, id: string, flag: boolean = false) => {
    const walletAmount = ctx.session.createWalletAmount || 1
    const text =
        `<b>Wallet Generation (Max: 40)</b>\n` +
        `This tool will generate a new wallets for your bundle. \n\n` +
        `<b><u>Please note that the private keys cannot be downloaded or viewed ever again, so make sure to save them in a secure place.</u></b>`
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: `Amount: ${walletAmount}`, callback_data: `scene_createWalletAmountScene_${id}` }],
                [
                    { text: '✖️ Cancel', callback_data: `manage_wallets_${id}` },
                    { text: `${flag === true ? '✔ Save' : '✨ Generate'}`, callback_data: `${flag === true ? `save_createWallet_${id}` : `generate_createWallet_${id}`}`  }
                ]
            ],
            resize_keyboard: true
        }
    })
}

export const generateWallets = async (ctx: any, id: string) => {
    const wallets: { address: string; key: string }[] = []
    const walletAmount = ctx.session.createWalletAmount || 1
    let walletInfo = ''
    for (let i = 0; i < walletAmount; i++) {
        const wallet = Wallet.createRandom()
        walletInfo += `wallet-#${i + 1} - ${wallet.address} \nPrivate Key: ${wallet.privateKey} \n\n`
        wallets.push({
            address: wallet.address,
            key: encrypt(wallet.privateKey)
        })
    }
    ctx.session.createdWallets = wallets
    // Create a temporary file with wallet information
    const fileName = `wallet_${Date.now()}.txt`
    fs.writeFileSync(fileName, walletInfo)
    await createWallets(ctx, id, true)
    // Send the file to the user
    await ctx.replyWithDocument(
        { source: fileName },
        {
            caption: 'Here are your wallets and their private keys. Make sure to save them in a secure place.',
            // reply_to_message_id: ctx.message.message_id, // Reply to the user's command message
            parse_mode: 'HTML',
            disable_notification: true
        }
    )

    // Delete the temporary file
    fs.unlinkSync(fileName)
}

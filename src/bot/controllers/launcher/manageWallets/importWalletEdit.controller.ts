import { ethers, Wallet } from 'ethers'
import { manageWallets } from '.'
import Launches from '@/models/Launch'

export const enterScene = async (ctx: any) => {
    ctx.reply(
        `<b>Enter the private key(s) of the wallets you want to import as wallet(s) 
</b>\n` + `<i>example: pvtk1, pvtk2, pvtk3:</i>`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                force_reply: true,
                one_time_keyboard: true,
                resize_keyboard: true
            }
        }
    )
}

function isValidPrivateKey(privateKey) {
    // Remove '0x' prefix if present
    privateKey = privateKey.replace(/^0x/, '')

    // Check if it's a valid hex string of 64 characters (32 bytes)
    return ethers.isHexString('0x' + privateKey, 32)
}

export const textHandler = async (ctx: any) => {
    const _value = ctx.message.text
    const { id } = ctx.scene.state
    const launch = await Launches.findById(id)
    const bundledWallets = launch.bundledWallets
    const privateKeyArr = _value.split(',')
    for (let i = 0; i < privateKeyArr.length; i++) {
        const privateKey = privateKeyArr[i].trim()
        if (isValidPrivateKey(privateKey) == false) continue
        const wallet = new Wallet(privateKey)
        bundledWallets.push({
            address: wallet.address,
            key: wallet.privateKey
        })
    }
    ctx.session.bundledWallets = bundledWallets
    await Launches.findByIdAndUpdate(id, { bundledWallets })
    await ctx.scene.leave()
    manageWallets(ctx, id)
}

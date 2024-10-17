import { ethers, Wallet } from 'ethers'
import { manageWallets } from '.'
import Launches from '@/models/Launch'
import { encrypt } from '@/share/utils'

export const enterScene = async (ctx: any) => {
    ctx.reply(`<b>Enter the private key(s) of the wallets you want to import as wallet(s) </b>\n` + `<i>example: pvtk1, pvtk2, pvtk3:</i>`, {
        parse_mode: 'HTML',
        reply_markup: {
            force_reply: true,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
}

const _walletFromKey = (key: string) => {
    try {
        const wallet = new Wallet(key)
        return wallet
    } catch (err) {
        return null
    }
}

export const textHandler = async (ctx: any) => {
    const _value = ctx.message.text
    const { id } = ctx.scene.state
    const launch = id ? await Launches.findById(id) : await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, {}, { new: true, upsert: true })
    const bundledWallets = launch.bundledWallets
    const privateKeyArr = _value
        .split(',')
        .map((v: string) => v.trim())
        .filter((v: string) => v)
    for (let i = 0; i < privateKeyArr.length; i++) {
        const privateKey = privateKeyArr[i]
        const _wallet = _walletFromKey(privateKey)
        if (_wallet) {
            bundledWallets.push({
                address: _wallet.address,
                key: encrypt(_wallet.privateKey)
            })
        } else {
            ctx.reply(`⚠ Invalid private ke is provided\n${privateKey}`)
        }
    }
    ctx.session.bundledWallets = bundledWallets
    if (id) {
        await Launches.findByIdAndUpdate(id, { bundledWallets }) //udpate existing launch
    } else {
        await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, { bundledWallets }, { new: true, upsert: true }) // update when crewating new launch
    }
    await ctx.scene.leave()
    manageWallets(ctx, id)
}

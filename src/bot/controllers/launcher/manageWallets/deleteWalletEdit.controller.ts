import { ethers, isAddress, Wallet } from 'ethers'
import { manageWallets } from '.'
import Launches from '@/models/Launch'

export const enterScene = async (ctx: any) => {
    const { id } = ctx.scene.state
    const launch = id ? await Launches.findById(id) : await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, {}, { new: true, upsert: true })
    const bundledWallets = launch.bundledWallets

    ctx.replyWithMarkdownV2(`*Enter the address of the wallet you would like to delete\\:* \n` + `_\\(example\\: \`${bundledWallets[0]?.address}\`\\)_`, {
        reply_markup: {
            force_reply: true,
            one_time_keyboard: true,
            resize_keyboard: true
        }
    })
}

export const textHandler = async (ctx: any) => {
    const _value = ctx.message.text
    const { id } = ctx.scene.state
    let launch = id ? await Launches.findById(id) : await Launches.findOneAndUpdate({ userId: ctx.chat.id, enabled: false }, {}, { new: true, upsert: true })
    const bundledWallets = launch.bundledWallets
    if (isAddress(_value)) {
        // Filter out the wallet with the matching address
        const removeIndex = bundledWallets.findIndex((b) => b.address === _value)
        if (removeIndex === -1) {
            ctx.reply(`⚠ No existing wallet for <code>${_value}</code>`, {
                parse_mode: 'HTML'
            })
        } else {
            console.log('::removeIndex', removeIndex)
            bundledWallets.splice(removeIndex, 1)
            launch.bundledWallets = bundledWallets
            await launch.save()
        }
        // Update the launch document with the new wallets array
        launch.bundledWallets = bundledWallets
        await ctx.scene.leave()
        manageWallets(ctx, id)
    } else {
        await ctx.reply(`Input must be a valid address.`)
    }
}

import { ethers, isAddress, Wallet } from 'ethers'
import { manageWallets } from '.'
import Launches from '@/models/Launch'

export const enterScene = async (ctx: any) => {
    const { id } = ctx.scene.state
    const launch = await Launches.findById(id)
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
    const launch = await Launches.findById(id)
    const bundledWallets = launch.bundledWallets
    if (isAddress(_value)) {
        // Filter out the wallet with the matching address
        const updatedWallets = bundledWallets.filter((wallet) => wallet.address !== _value)

        // Update the launch document with the new wallets array
        await Launches.findByIdAndUpdate(
            id,
            { $set: { bundledWallets: updatedWallets } },
            { new: true } // This option returns the updated document
        )

        ctx.session.bundledWallets = updatedWallets
        await ctx.scene.leave()
        manageWallets(ctx, id)
    } else {
        await ctx.reply(`Input must be a valid address.`)
    }
}

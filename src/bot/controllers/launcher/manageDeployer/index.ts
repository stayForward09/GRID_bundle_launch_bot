import { CHAIN_INFO } from '@/config/constant'
import Launches from '@/models/Launch'
import { compileContract } from '@/share/utils'
import { ContractFactory, ethers, JsonRpcProvider, Wallet } from 'ethers'
import { decrypt } from '@/share/utils'

export const manageDeployer = async (ctx: any, id: string) => {
    const launch = await Launches.findById(id)
    const provider = new JsonRpcProvider(CHAIN_INFO.RPC)
    const deployerAddress = launch.deployer?.address || ''
    // Get the balance in wei
    const balanceWei = await provider.getBalance(deployerAddress)
    // Convert wei to ether
    const balanceEth = ethers.formatEther(balanceWei)
    const text =
        `*Deployer*\n` +
        `Use this menu to manage your deployer\\. \n\n` +
        `*Send ETH * –  Transfer ETH to another Address\\.\n` +
        `*Estimate Deployment Cost * – Using the current GWEI, GridBot will estimate the cost of deployment for your Token Launch\\. This is the minimum amount of ETH that will be required to be in the Deployer at the time of launch\\. This does not include the ETH required to be added to the Liquidity Pool \\(LP\\)\\.\n\n\n` +
        `Address: \`${deployerAddress}\`\n` +
        `Balance: \`${balanceEth} ETH \`\n`
    ctx.replyWithMarkdownV2(text, {
        reply_markup: {
            one_time_keyboard: true,
            inline_keyboard: [
                [{ text: '⬅️ Back', callback_data: `manage_launch_${id}` }],
                [
                    { text: '📤 Send ETH', callback_data: `send_eth_${id}` },
                    { text: '📐 Estimate Deployment Cost ', callback_data: `estimate_DeploymentCost_${id}` }
                ],
                [{ text: '🔮 Predict Token Address', callback_data: `predict_tokenAddress_${id}` }]
            ],
            // eslint-disable-next-line prettier/prettier
            resize_keyboard: true
        }
    })
}

export const sendEth = async (ctx: any, id: string) => {
    const launch = await Launches.findById(id)
    const provider = new JsonRpcProvider(CHAIN_INFO.RPC)
    const deployerAddress = launch.deployer?.address || ''
    // Get the balance in wei
    const balanceWei = await provider.getBalance(deployerAddress)
    // Convert wei to ether
    const balanceEth = ethers.formatEther(balanceWei)

    const receiverAddress = ctx.session?.ethReceiveAddress
    const amount = ctx.session?.ethReceiverAmount
    console.log('receiverAddress:amount', receiverAddress, amount)

    const text = `*Deployer Send*\n` + `Use this menu to send ETH from your deployer\\. \n\n` + `♠ [*deployer*](${CHAIN_INFO.explorer}\\/address\\/${deployerAddress}) ♠\n` + `\`${deployerAddress}\`\n` + `Balance: \`${balanceEth} ETH \`\n`

    ctx.replyWithMarkdownV2(text, {
        reply_markup: {
            one_time_keyboard: true,
            resize_keyboard: true,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            inline_keyboard: [
                [
                    { text: `Receiver: ${receiverAddress ? receiverAddress : 'Unset'}`, callback_data: `scene_sendEthReceiverAddressEditorScene_${id}` },
                    { text: `Amount: ${amount ? amount : '0.0'} ETH`, callback_data: `scene_receiverAmountEditorScene_${id}` }
                ],
                [
                    { text: '✖ Cancel', callback_data: `manage_deployer_${id}` },
                    { text: '📤 Send', callback_data: `sendEth_confirm_${id}` }
                ]
            ]
        }
    })
}

export const sendEthConfirm = async (ctx: any, id: string) => {
    const launch = await Launches.findById(id)
    try {
        const provider = new JsonRpcProvider(CHAIN_INFO.RPC)
        const privateKey = launch.deployer?.key
        const deployerAddress = launch.deployer?.address
        const wallet = new Wallet(privateKey, provider)
        // Convert the amount from ether to wei
        const amountInEther = ctx.session?.ethReceiverAmount
        const amountWei = ethers.parseEther(amountInEther.toString())
        // Get the balance in wei
        const balanceWei = await provider.getBalance(deployerAddress)

        // Create the transaction object
        const toAddress = ctx.session?.ethReceiveAddress
        const tx = {
            to: toAddress,
            value: amountWei
        }
        // Send the transaction
        ctx.reply(`🕐 Sending transaction...`)
        const transaction = await wallet.sendTransaction(tx)

        // Wait for the transaction to be mined
        const receipt = await transaction.wait()
        ctx.reply(`✔ Transaction successful with hash: ${receipt.hash}`)
        manageDeployer(ctx, id)
    } catch (err) {
        console.log(err)
        if (String(err).includes('insufficient funds for intrinsic transaction cost'))
            await ctx.reply('Insufficient funds for gas + value', {
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true,
                    parse_mode: 'HTML',
                    inline_keyboard: [[{ text: '🔴 Failed', callback_data: `#` }]]
                }
            })
        else {
            await ctx.reply(`<b>Transaction Error: </b><code>${String(err).split(':')[1]}</code>`, {
                parse_mode: 'HTML',
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true,
                    parse_mode: 'HTML',
                    inline_keyboard: [[{ text: '🔴 Failed', callback_data: `#` }]]
                }
            })
        }
    }
}

export const estimateDeploymentCost = async (ctx: any, id: string) => {
    const launch = await Launches.findById(id)
    if (!launch) {
        ctx.reply(`⚠ There is no launch for this. Please check again`)
        return
    }
    try {
        const { abi, bytecode, sourceCode } = (await compileContract({
            name: launch.name,
            symbol: launch.symbol,
            totalSupply: launch.totalSupply,
            sellFee: launch.sellFee,
            buyFee: launch.buyFee,
            liquidityFee: launch.liquidityFee,
            instantLaunch: launch.instantLaunch,
            feeWallet: launch.feeWallet == 'Deployer Wallet' ? launch.deployer.address : launch.feeWallet
        })) as any
        console.log(sourceCode)
        console.log('succeed complied')
        const _jsonRpcProvider = new JsonRpcProvider(CHAIN_INFO.RPC);
        // const _privteKey = decrypt(launch.deployer.key);
        const _privteKey = launch.deployer.key;
        // Set your wallet's private key (Use environment variables or .env in real apps)
        const wallet = new Wallet(_privteKey, _jsonRpcProvider);
        console.log({_privteKey, wallet})
        // Create a contract factory
        const contractFactory = new ContractFactory(abi, bytecode, wallet)
        // Get current gas price
        const gasPrice = (await _jsonRpcProvider.getFeeData()).gasPrice
        console.log('gasPrice', gasPrice)
        // Estimate gas
        const deploymentTx = await contractFactory.getDeployTransaction()
        const estimatedGas = await _jsonRpcProvider.estimateGas(deploymentTx)
        console.log('estimate', estimatedGas)
        // Calculate deployment cost in ETH
        const deploymentCost = ethers.formatEther(estimatedGas * gasPrice)
        console.log(`Estimated gas: ${estimatedGas.toString()}`)
        console.log(`Current gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`)
        console.log(`Estimated deployment cost: ${deploymentCost} ETH`)
        const text = `*Estimated Gas Cost * \n` + `Current Price \\: \`${ethers.formatUnits(gasPrice, 'gwei')} gwei \`` + `Gas Cost \\: \` ${deploymentCost} ETH \`\n\n` + `Required Balance \\:  \` ${Number(deploymentCost) + 1} ETH \``
        ctx.replyWithMarkdownV2(text, {
            reply_markup: {
                one_time_keyboard: true,
                // eslint-disable-next-line prettier/prettier
                resize_keyboard: true
            }
        })
    } catch (err) {
        console.log(err)
        await ctx.reply(`<b>Error: </b><code>${String(err).split(':')[1]}</code>`, {
            parse_mode: 'HTML',
            reply_markup: {
                one_time_keyboard: true,
                resize_keyboard: true,
                parse_mode: 'HTML',
                inline_keyboard: [[{ text: '🔴 Failed', callback_data: `#` }]]
            }
        })
    }
}

export const predictContractAddress = async (ctx: any, id: string) => {
    const launch = await Launches.findById(id)
    try {
        const _jsonRpcProvider = new JsonRpcProvider(CHAIN_INFO.RPC)
        // const _privteKey = decrypt(launch.deployer.key);
        const _privteKey = launch.deployer.key
        const wallet = new Wallet(_privteKey, _jsonRpcProvider)

        // Get the nonce
        const nonce = await wallet.getNonce()

        // Calculate the contract address
        const contractAddress = ethers.getCreateAddress({
            from: wallet.address,
            nonce: nonce
        })

        const text = `This is the predicted contract address \\: \n \`${contractAddress} \`\n\n` + `_Keep in mind that this address will change every time the deployer wallet sends a new transaction\\._`
        ctx.replyWithMarkdownV2(text, {
            reply_markup: {
                one_time_keyboard: true,
                // eslint-disable-next-line prettier/prettier
                resize_keyboard: true
            }
        })
    } catch (err) {
        await ctx.reply(`<b>Error: </b><code>${String(err).split(':')[1]}</code>`, {
            parse_mode: 'HTML',
            reply_markup: {
                one_time_keyboard: true,
                resize_keyboard: true,
                parse_mode: 'HTML',
                inline_keyboard: [[{ text: '🔴 Failed', callback_data: `#` }]]
            }
        })
    }
}

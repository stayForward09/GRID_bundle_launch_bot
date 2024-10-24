import { compileContract, decrypt } from '@/share/utils'
import { ContractFactory, JsonRpcProvider, Wallet, Provider, Contract, parseEther, ZeroAddress, getCreateAddress, FeeData, parseUnits } from 'ethers'
import Tokens, { IToken } from '@/models/Tokens'
import Launches, { ILanuch } from '@/models/Launch'
import { AUTH_HEADER } from '@/bot/controllers/launcher/config'
import axios from 'axios'
import RouterABI from '@/constants/ABI/routerABI.json'
import ContractABI from '@/constants/ABI/contractABI.json'
import BribeContractABI from '@/constants/ABI/routerABI.json'
import { channel } from 'diagnostics_channel'
import WebSocket, { WebSocketServer } from 'ws'

import { CHAIN_ID } from '@/config/constant'
import { CHAINS } from '@/config/constant'
import { Document, Types } from 'mongoose'

export const menu = async (ctx: any) => {
    const _launches = await Launches.find({ userId: ctx.chat.id, enabled: true })

    const text = `<b>Select a Launch:</b>\n`
    const tokens = []

    for (let i = 0; i < _launches.length; i += 2) {
        const element =
            i + 1 >= _launches.length
                ? [{ text: _launches[i].name, callback_data: `launch_preview_${_launches[i].id}` }]
                : [
                      { text: _launches[i].name, callback_data: `launch_preview_${_launches[i].id}` },
                      { text: _launches[i + 1].name, callback_data: `launch_preview_${_launches[i + 1].id}` }
                  ]
        tokens.push(element)
    }
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [...tokens, [{ text: '← back', callback_data: 'launcher' }]],
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
    const launch = await Launches.findById(id)
    if (launch) {
        const text =
            `<b>Are you sure you want to launch</b> <code>${launch.name}</code>?\n` +
            `<u>Since you do not have any token fees, a flat liquidity fee of</u> <code>${launch.lpEth} ETH</code> <u>will be charged directly from the deployer.</u>\n\n` +
            `<b>Please ensure the following parameters are correct:</b>\n` +
            `<i>Token Name:</i> ${launch.name}\n` +
            `<i>Symbol:</i> ${launch.symbol}\n` +
            `<i>Token Supply:</i> ${Intl.NumberFormat().format(launch.totalSupply)}\n` +
            `<i>Buy Tax:</i> ${launch.buyFee}\n` +
            `<i>Sell Tax:</i> ${launch.sellFee}\n` +
            `<i>Liquidity Tax:</i> ${launch.liquidityFee}\n` +
            `<i>Max Wallet:</i> ${launch.maxWallet}\n` +
            `<i>Max Swap:</i> ${launch.maxSwap}\n` +
            `<i>Fee Wallet:</i> ${launch.feeWallet}\n`
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
                ]
            }
        })
    } else {
        ctx.reply('no launch')
    }
}

/**
 * make contract deployment tx
 * @param chainId
 * @param abi
 * @param bytecode
 * @param nonce
 * @param feeData
 * @param wallet
 * @returns
 */
const makeDeploymentTransaction = async (chainId: number, abi: any, bytecode: any, nonce: number, feeData: FeeData, wallet: Wallet) => {
    // Create a contract factory
    const contractFactory = new ContractFactory(abi, bytecode, wallet)
    const deploymentTxData = await contractFactory.getDeployTransaction()
    return {
        ...deploymentTxData,
        chainId,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasLimit: 10000000,
        nonce: nonce,
        type: 2
    }
}
/**
 * make approve tx
 * @param chainId
 * @param contractAddress
 * @param tokenAmount
 * @param nonce
 * @param feeData
 * @param wallet
 * @returns
 */
const makeApproveTransaction = async (chainId: number, contractAddress: string, tokenAmount: bigint, nonce: number, feeData: FeeData, wallet: Wallet) => {
    const _tokenContract = new Contract(contractAddress, ContractABI, wallet)
    const _routerAddress = CHAINS[CHAIN_ID].UNISWAP_ROUTER_ADDRESS
    const approveTxData = await _tokenContract.approve.populateTransaction(_routerAddress, tokenAmount)
    return {
        ...approveTxData,
        chainId,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasLimit: 1000000,
        nonce: nonce,
        type: 2
    }
}
/**
 * make addLP transaction data
 * @param chainId
 * @param contractAddress
 * @param tokenAmount
 * @param lpEth
 * @param deadline
 * @param nonce
 * @param feeData
 * @param wallet
 * @returns
 */
const makeAddLpTransaction = async (chainId: number, contractAddress: string, tokenAmount: bigint, lpEth: number, deadline: number, nonce: number, feeData: FeeData, wallet: Wallet) => {
    const CHAIN = CHAINS[chainId]
    const _routerContract = new Contract(CHAIN.UNISWAP_ROUTER_ADDRESS, RouterABI, wallet)
    const ethAmount = parseEther(lpEth.toString())

    const addLpTxData = await _routerContract.addLiquidityETH.populateTransaction(
        contractAddress,
        tokenAmount, // The amount of tokens
        0, // Minimum amount of tokens (set to 0 for no minimum)
        0, // Minimum amount of ETH (set to 0 for no minimum)
        wallet.address, // The wallet address
        deadline, // Transaction deadline
        { value: ethAmount } // ETH amount being sent with the transaction
    )

    return {
        ...addLpTxData,
        chainId,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasLimit: 1000000,
        nonce: nonce,
        type: 2
    }
}
/**
 * make buy trx
 * @param chainId
 * @param routerContract
 * @param deployer
 * @param deployerNonce
 * @param walletes
 * @param minBuy
 * @param maxBuy
 * @param jsonRpcProvider
 * @param totalSupply
 * @param path
 * @param deadline
 * @param feeData
 * @returns
 */
const makeBundleWalletTransaction = async (
    chainId: number,
    routerContract: Contract,
    deployer: string,
    deployerNonce: number,
    walletes: any,
    minBuy: number,
    maxBuy: number,
    jsonRpcProvider: JsonRpcProvider,
    totalSupply: number,
    path: string[],
    deadline: number,
    feeData: FeeData
) => {
    let signedTxs: string[] = []

    const nonceMap = new Map<string, number>()
    nonceMap.set(deployer, deployerNonce) // use this for nonce maps

    for (let index = 0; index < walletes.length; index++) {
        const privteKey = decrypt(walletes[index].key)
        const wallet = new Wallet(privteKey, jsonRpcProvider)
        const amount = Math.random() * (maxBuy - minBuy) + minBuy
        const tokenAmount = Math.ceil(totalSupply * amount * 0.01)
        const ethAmountPay = await routerContract.getAmountIn(tokenAmount, path[1], path[0])

        const nonce = nonceMap.get(wallet.address) ?? (await wallet.getNonce())
        nonceMap.set(wallet.address, nonce + 1)
        console.log(`::bundledWallet ${index}`, { tokenAmount, ethAmountPay, address: wallet.address, nonce })
        // Set your wallet's private key (Use environment variables or .env in real apps)
        const buyLpTxData = await routerContract.swapExactETHForTokensSupportingFeeOnTransferTokens.populateTransaction(
            tokenAmount,
            path,
            wallet.address, // The wallet address
            deadline, // Transaction deadline
            { value: ethAmountPay } // ETH amount being sent with the transaction
        )
        signedTxs.push(
            await wallet.signTransaction({
                ...buyLpTxData,
                chainId,
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                gasLimit: 700000,
                nonce,
                type: 2
            })
        )
    }
    return signedTxs
}
/**
 * execute signed tx using ethers
 * @param txData
 */
const executeSimulationTx = async (chainId: number, txData: string) => {
    try {
        const _jsonRpcProvider = new JsonRpcProvider(CHAINS[chainId].RPC)
        const txResponse = await _jsonRpcProvider.broadcastTransaction(txData)
        console.log('Transaction hash:', txResponse.hash)
        // Wait for the transaction to be mined
        const receipt = await txResponse.wait()
        console.log('tx Hash:', receipt.hash)
        console.log('Transaction included in block:', receipt.blockNumber)
    } catch (err) {
        console.error('Error deploying contract:', err)
    }
}
/**
 * when instant launch
 * @param ctx
 * @param id
 * @param launch
 */
const launchWithInstant = async (
    ctx: any,
    id: string,
    launch: Document<unknown, {}, ILanuch> &
        ILanuch & {
            _id: Types.ObjectId
        } & {
            __v?: number
        }
) => {
    const CHAIN = CHAINS[CHAIN_ID]
    const chainId = CHAIN.chainId

    console.log('::chain info:', CHAIN)
    try {
        ctx.reply(`🕐 Compiling contract...`)
        console.log('::compiling contract...')
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
        console.log('::successfully compiled...')
        // ----------------------------------------------------------------- variables for contract launch --------------------------------------------------------------------------------
        const { lpEth, totalSupply, lpSupply, maxBuy, minBuy, bundledWallets } = launch
        const _jsonRpcProvider = new JsonRpcProvider(CHAIN.RPC)
        const _privteKey = decrypt(launch.deployer.key)
        // feeData
        // const feeData = await _jsonRpcProvider.getFeeData()
        const block = await _jsonRpcProvider.getBlock('latest')

        // Set the minimum fee (1 gwei) for EIP-1559
        const minGas = parseUnits('1', 'gwei')
        const baseFee = block.baseFeePerGas || parseUnits('1', 'gwei')
        const feeData = {
            gasPrice: minGas,
            maxPriorityFeePerGas: minGas,
            maxFeePerGas: minGas + baseFee
        } as FeeData
        console.log('::new FeeData', feeData)
        // Set your wallet's private key (Use environment variables or .env in real apps)
        const wallet = new Wallet(_privteKey, _jsonRpcProvider)
        // Get the nonce
        const nonce = await wallet.getNonce()
        // Predict contract address
        const contractAddress = getCreateAddress({
            from: wallet.address,
            nonce: nonce
        })
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20mins from now
        // token amount for LP
        const tokenAmount = parseEther((Number(totalSupply) * Number(lpSupply) * 0.01).toString())
        // path
        const _routerContract = new Contract(CHAIN.UNISWAP_ROUTER_ADDRESS, RouterABI, wallet)
        const path = [await _routerContract.WETH(), contractAddress]

        // ----------------------------------------------------------------- transactions for bundle ------------------------------------------------------------------------------------------
        const deploymentTxData = await makeDeploymentTransaction(chainId, abi, bytecode, nonce, feeData, wallet)
        const approveTxData = await makeApproveTransaction(chainId, contractAddress, tokenAmount, nonce + 1, feeData, wallet)
        const addLpTxData = await makeAddLpTransaction(chainId, contractAddress, tokenAmount, lpEth, deadline, nonce + 2, feeData, wallet)
        const bribeTxData = {
            from: wallet.address,
            to: CHAIN.BRIBE_ADDRESS,
            value: CHAIN.BRIBE_AMOUNT,
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            gasLimit: 1000000,
            nonce: nonce + 3,
            chainId,
            type: 2
        }

        const bundleWalletsSignedTxs = await makeBundleWalletTransaction(chainId, _routerContract, wallet.address, nonce + 4, bundledWallets, minBuy, maxBuy, _jsonRpcProvider, launch.totalSupply, path, deadline, feeData)
        // setup tx array
        const bundleTxs = [deploymentTxData, approveTxData, addLpTxData, bribeTxData]
        // sign bundle txs batch
        const bundleDeployerSignedTxs = await Promise.all(bundleTxs.map(async (b) => await wallet.signTransaction(b)))
        const bundleSignedTxs = [...bundleDeployerSignedTxs, ...bundleWalletsSignedTxs]
        // await Promise.all(bundleSignedTxs.map((b) => executeSimulationTx(b)))

        const blockNumber: number = await _jsonRpcProvider.getBlockNumber()
        const nextBlock = blockNumber
        const requestData = {
            jsonrpc: '2.0',
            id: '1',
            method: 'eth_sendMevBundle',
            params: [
                {
                    txs: bundleSignedTxs, // List of signed raw transactions
                    maxBlockNumber: nextBlock + 100 // The maximum block number for the bundle to be valid, with the default set to the current block number + 100
                    // "minTimestamp":1710229370,   // Expected minimum Unix timestamp (in seconds) for the bundle to be valid
                    // "maxTimestamp":1710829390,   // Expected maximum Unix timestamp (in seconds) for the bundle to be valid
                }
            ]
        }
        const config = {
            headers: {
                'Content-Type': 'application/json'
                // Authorization: AUTH_HEADER
            }
        }
        try {
            console.log('::sending bundles...')
            const response = await axios.post(`https://bsc.blockrazor.xyz/${process.env.BLOCK_API_KEY}`, requestData, config)
            console.log('::sent...')
            console.log('response.data: ', response.data)
        } catch (error) {
            console.error('Error in sending bundle transaction:')
            throw 'Error in sending bundle transaction'
        }

        console.log('::ended::::')
        new Tokens({
            userId: ctx.chat.id,
            instantLaunch: launch.instantLaunch,
            autoLP: launch.autoLP,
            name: launch.name,
            symbol: launch.symbol,
            totalSupply: launch.totalSupply,
            maxSwap: launch.maxSwap,
            maxWallet: launch.maxWallet,
            blacklistCapability: launch.blacklistCapability,
            lpSupply: launch.lpSupply,
            lpEth: launch.lpEth,
            contractFunds: launch.contractFunds,
            feeWallet: launch.feeWallet,
            buyFee: launch.buyFee,
            sellFee: launch.sellFee,
            liquidityFee: launch.liquidityFee,
            swapThreshold: launch.swapThreshold,
            website: launch.website,
            twitter: launch.twitter,
            telegram: launch.telegram,
            custom: launch.custom,
            deployer: launch.deployer,
            // contract data
            address: contractAddress,
            verified: false,
            abi: JSON.stringify(abi),
            byteCode: bytecode,
            sourceCode: sourceCode
        }).save()
        await ctx.reply(`<b>✔ Contract has been deployed successfully.</b>\n\n` + `<b>Address: </b><code>${contractAddress}</code>\n` + `<u><a href='${CHAIN.explorer}/address/${contractAddress}'>👁 Go to contract</a></u>`, {
            parse_mode: 'HTML',
            reply_markup: {
                one_time_keyboard: true,
                resize_keyboard: true,
                inline_keyboard: [
                    [
                        { text: 'Back', callback_data: `launch_token` },
                        { text: 'Tokens', callback_data: `tokens` }
                    ]
                ]
            }
        })
    } catch (err) {
        console.log(err)
        if (String(err).includes('insufficient funds for intrinsic transaction cost')) {
            await ctx.reply(`<b>❌ Deployment failed.</b>\n\nTry again with an increased bribe boost of 20% (every time you try again, the bribe boost is increased by 20% from the previous try)`, {
                parse_mode: 'HTML',
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true,
                    inline_keyboard: [
                        [
                            { text: 'Cancel', callback_data: `launch_token` },
                            { text: 'Try Again', callback_data: `launch_token_${id}` }
                        ]
                    ]
                }
            })
            await ctx.reply(`<b>Deployment Error: </b><code>Insufficient funds for gas + value</code>\n\nYou can contact <a href='http://app.support'>Support</a> if necessary`, {
                parse_mode: 'HTML',
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            })
        } else {
            await ctx.reply(`<b>Deployment Error: </b><code>${String(err).substring(0, 40)}</code>\n\nYou can contact <a href='http://app.support'>Support</a> if necessary`, {
                parse_mode: 'HTML',
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            })
        }
    }
}

/**
 * token launch
 * @param ctx
 * @param id
 */
export const tokenLaunch = async (ctx: any, id: string) => {
    const launch = await Launches.findById(id)
    if (!launch) {
        ctx.reply(`⚠ There is no launch for this. Please check again`)
        return
    }

    if (launch.instantLaunch) {
        launchWithInstant(ctx, id, launch)
    } else if (launch.autoLP) {
        //TODO: when autoLP
    } else {
        //TODO: when normal launch
    }
}

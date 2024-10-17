import { CHAIN_INFO } from '@/config/constant'
import { compileContract, decrypt } from '@/share/utils'
import { ContractFactory, JsonRpcProvider, Wallet, Provider, Contract, parseEther, ZeroAddress, getCreateAddress, FeeData } from 'ethers'
import Tokens from '@/models/Tokens'
import Launches from '@/models/Launch'
import { AUTH_HEADER } from '@/bot/controllers/launcher/config'
import axios from 'axios'
import RouterABI from '@/constants/ABI/routerABI.json'
import ContractABI from '@/constants/ABI/contractABI.json'
import BribeContractABI from '@/constants/ABI/routerABI.json'
import { channel } from 'diagnostics_channel'
import WebSocket, { WebSocketServer } from 'ws'

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
 * @param abi
 * @param bytecode
 * @param nonce
 * @param feeData
 * @param wallet
 * @returns
 */
const makeDeploymentTransaction = async (abi: any, bytecode: any, nonce: number, feeData: FeeData, wallet: Wallet) => {
    // Create a contract factory
    const contractFactory = new ContractFactory(abi, bytecode, wallet)
    const deploymentTxData = await contractFactory.getDeployTransaction()
    return {
        ...deploymentTxData,
        chainId: CHAIN_INFO.chainId,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasLimit: 7000000,
        nonce: nonce
    }
}
/**
 * make approve tx
 * @param contractAddress
 * @param tokenAmount
 * @param nonce
 * @param feeData
 * @param wallet
 * @returns
 */
const makeApproveTransaction = async (contractAddress: string, tokenAmount: bigint, nonce: number, feeData: FeeData, wallet: Wallet) => {
    const _tokenContract = new Contract(contractAddress, ContractABI, wallet)
    const approveTxData = await _tokenContract.approve.populateTransaction(process.env.UNISWAP_ROUTER_ADDRESS, tokenAmount)
    // console.log('approve txData', approveTxData)
    return {
        ...approveTxData,
        chainId: CHAIN_INFO.chainId,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasLimit: 700000,
        nonce: nonce
    }
}
/**
 * make addLP transaction data
 * @param contractAddress
 * @param tokenAmount
 * @param lpEth
 * @param deadline
 * @param nonce
 * @param feeData
 * @param wallet
 * @returns
 */
const makeAddLpTransaction = async (contractAddress: string, tokenAmount: bigint, lpEth: number, deadline: number, nonce: number, feeData: FeeData, wallet: Wallet) => {
    const _routerContract = new Contract(process.env.UNISWAP_ROUTER_ADDRESS, RouterABI, wallet)
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
        chainId: CHAIN_INFO.chainId,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasLimit: 700000,
        nonce: nonce
    }
}
/**
 * make bundle wallet buy tx
 * @param routerContract
 * @param bundledWallet
 * @param jsonRpcProvider
 * @param totalSupply
 * @param path
 * @param deadline
 * @param nonce
 * @param feeData
 * @returns
 */

/**
 * make buy trx
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
                chainId: CHAIN_INFO.chainId,
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                gasLimit: 700000,
                nonce
            })
        )
    }
    return signedTxs
}
/**
 * execute signed tx using ethers
 * @param txData
 */
const executeSimulationTx = async (txData: string) => {
    try {
        const _jsonRpcProvider = new JsonRpcProvider(CHAIN_INFO.RPC)
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

    try {
        ctx.reply(`🕐 Compiling contract...`)
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
        // ----------------------------------------------------------------- variables for contract launch --------------------------------------------------------------------------------
        const { lpEth, totalSupply, lpSupply, maxBuy, minBuy, bundledWallets } = launch
        const _jsonRpcProvider = new JsonRpcProvider(CHAIN_INFO.RPC)
        const _privteKey = decrypt(launch.deployer.key)
        // feeData
        const feeData = await _jsonRpcProvider.getFeeData()
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
        const _routerContract = new Contract(process.env.UNISWAP_ROUTER_ADDRESS, RouterABI, wallet)
        const path = [await _routerContract.WETH(), contractAddress]

        // ----------------------------------------------------------------- transactions for bundle ------------------------------------------------------------------------------------------
        const deploymentTxData = await makeDeploymentTransaction(abi, bytecode, nonce, feeData, wallet)
        const approveTxData = await makeApproveTransaction(contractAddress, tokenAmount, nonce + 1, feeData, wallet)
        const addLpTxData = await makeAddLpTransaction(contractAddress, tokenAmount, lpEth, deadline, nonce + 2, feeData, wallet)
        const bridgeTxData = {
            from: wallet.address,
            to: process.env.BRIBE_ADDRESS,
            value: process.env.BRIBE_AMOUNT,
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            gasLimit: 700000,
            nonce: nonce + 3,
            chainId: CHAIN_INFO.chainId
        }

        const bundleWalletsSignedTxs = await makeBundleWalletTransaction(_routerContract, wallet.address, nonce + 4, bundledWallets, minBuy, maxBuy, _jsonRpcProvider, launch.totalSupply, path, deadline, feeData)
        // setup tx array
        const bundleTxs = [deploymentTxData, approveTxData, addLpTxData, bridgeTxData]
        // sign bundle txs batch
        const bundleDeployerSignedTxs = await Promise.all(bundleTxs.map(async (b) => await wallet.signTransaction(b)))

        const bundleSignedTxs = [...bundleDeployerSignedTxs, ...bundleWalletsSignedTxs]

        console.log(bundleSignedTxs)

        await Promise.all(bundleSignedTxs.map((b) => executeSimulationTx(b)))
        console.log('::ended::::')
        // const bribeTx = {
        //     from: wallet.address,
        //     to: process.env.BRIBE_ADDRESS,
        //     value: process.env.BRIBE_AMOUNT,
        //     gas: 400000,
        //     nonce: nonce,
        //     chainId: CHAIN_INFO.chainId
        //     // chainId: 56 // BSC Mainnet
        //     // chainId: 1 // Mainnet
        // }

        return
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
        await ctx.reply(`<b>✔ Contract has been deployed successfully.</b>\n\n` + `<b>Address: </b><code>${contractAddress}</code>\n` + `<u><a href='${CHAIN_INFO.explorer}/address/${contractAddress}'>👁 Go to contract</a></u>`, {
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

        // console.log(bundleTxs);

        // try {
        //     let signedTransactions = await Promise.all(bundleTxs.map(async (t) => await wallet.signTransaction(t)))
        //     signedTransactions = [...signedBuyTransactions, ...signedBuyTransactions]
        //     console.log(signedTransactions)
        //     bundleSubmission = signedTransactions.map((tx: any) => tx.substr(2))
        //     const blockNumber: number = await _jsonRpcProvider.getBlockNumber()
        //     const nextBlock = blockNumber + 2
        //     const blockHexNumNext = web3.utils.numberToHex(nextBlock)
        //     const blockHexNum = web3.utils.numberToHex(blockNumber)

        //     console.log({
        //         blockHexNumNext,
        //         blockHexNum
        //     })

        //     const ws = new WebSocket('wss://mev.api.blxrbdn.com/ws', {
        //         headers: {
        //             Authorization: AUTH_HEADER
        //         },
        //         rejectUnauthorized: false
        //     })

        //     // Optionally, handle the connection open event
        //     ws.onopen = () => {
        //         // You can send an authorization message if needed
        //         // ws.send(JSON.stringify({ auth: AUTH_HEADER }));
        //         proceed()
        //     }

        //     // Handle incoming messages
        //     // ws.onmessage = (event: any) => {
        //     //     const simulationResult = JSON.parse(event.data); // Parse the incoming message
        //     //     console.log('Received simulation result:', simulationResult);

        //     //     // You can handle the simulation result here
        //     //     // For example, you could check for errors or process the result further
        //     // };

        //     function proceed() {
        //         const message = {
        //             jsonrpc: '2.0',
        //             id: '1',
        //             method: 'blxr_submit_bundle',
        //             params: {
        //                 transaction: bundleSubmission,
        //                 block_number: `${blockHexNumNext}`,
        //                 blockchain_network: 'BSC-Mainnet',
        //                 mev_builders: {
        //                     bloxroute: '',
        //                     flashbots: '',
        //                     all: ''
        //                 }
        //             }
        //         }
        //         ws.send(JSON.stringify(message)) // Stringify the message
        //     }

        //     console.log('after proceed function')

        //     function handle(response) {
        //         console.log(response.toString())
        //     }
        //     ws.on('open', proceed)
        //     ws.on('message', handle)
        //     console.log('finished')

        //     // const config = {
        //     //     headers: {
        //     //         'Content-Type': 'application/json',
        //     //         Authorization: AUTH_HEADER,
        //     //     },
        //     // };

        //     // // simulate
        //     // const requestSimulateData = {
        //     //     id: '1',
        //     //     method: 'blxr_simulate_bundle',
        //     //     params: {
        //     //         transaction: bundleSubmission,
        //     //         // blockchain_network: 'ETH-Mainnet',
        //     //         block_number: '0x' + blockNumber.toString(16),
        //     //         // mev_builders: {
        //     //         //   all: '',
        //     //         // },
        //     //     },
        //     // };

        //     // const responseSimulate = await axios.post(
        //     //     'https://mev.api.blxrbdn.com',
        //     //     requestSimulateData,
        //     //     config
        //     // );
        //     // if (responseSimulate) {
        //     //     return responseSimulate.data;
        //     // } else {
        //     //     console.log('simulate error');
        //     //     return null;
        //     // }

        //     // const requestData = {
        //     //     id: '1',
        //     //     method: 'blxr_submit_bundle',
        //     //     params: {
        //     //         transaction: bundleSubmission,
        //     //         // blockchain_network: 'ETH-Mainnet',
        //     //         block_number: '0x' + blockNumber.toString(16),
        //     //         // mev_builders: {
        //     //         //   all: '',
        //     //         // },
        //     //     },
        //     // };

        //     // console.log('Request Data:', requestData);

        //     // const response = await axios.post(
        //     //     'https://mev.api.blxrbdn.com',
        //     //     requestData,
        //     //     config
        //     // );
        //     // if (response) {
        //     //     return response.data;
        //     // } else {
        //     //     console.log('submit error');
        //     //     return null;
        //     // }
        // } catch (error) {
        //     if (axios.isAxiosError(error)) {
        //         console.error('Error Details:', error.response?.data)
        //     }
        //     console.error('Error:', error)
        //     return null
        // }
    } catch (err) {
        // console.log(err)
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
                        // [
                        //     { text: 'Cancel', callback_data: `launch_token` },
                        // ],
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
export const tokenLaunchTemp = async (ctx: any, id: string) => {
    const launch = await Launches.findById(id)
    if (!launch) {
        ctx.reply(`⚠ There is no launch for this. Please check again`)
        return
    }
    try {
        ctx.reply(`🕐 Compiling contract...`)
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

        const { lpEth, totalSupply, lpSupply } = launch

        const _jsonRpcProvider = new JsonRpcProvider(CHAIN_INFO.RPC)
        const feeData = await _jsonRpcProvider.getFeeData()

        const _privteKey = decrypt(launch.deployer.key)
        // Set your wallet's private key (Use environment variables or .env in real apps)
        const wallet = new Wallet(_privteKey, _jsonRpcProvider)
        // Get the nonce
        const nonce = await wallet.getNonce()
        // Calculate the contract address
        let contractAddress = getCreateAddress({
            from: wallet.address,
            nonce: nonce
        })
        console.log('::contractAddress: ', contractAddress)
        // Create a contract factory
        const contractFactory = new ContractFactory(abi, bytecode, wallet)
        const deploymentTxData = await contractFactory.getDeployTransaction()

        let bundleSubmission: any

        let bundleTxs: any[] = []
        bundleTxs.push({
            ...deploymentTxData,
            chainId: CHAIN_INFO.chainId,
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            gasLimit: 7000000,
            nonce: nonce
        })
        // uniswap router
        const _routerContract = new Contract(process.env.UNISWAP_ROUTER_ADDRESS, RouterABI, wallet)
        const tokenAmount = parseEther((Number(totalSupply) * Number(lpSupply) * 0.01).toString())
        const ethAmount = parseEther(lpEth.toString())
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20mins from now
        // console.log('tokenAmount: ', tokenAmount)
        // console.log('ethAmount: ', ethAmount)
        // console.log('WETH address: ', await _routerContract.WETH())
        // console.log('deadline: ', deadline)

        const _tokenContract = new Contract(contractAddress, ContractABI, wallet)
        const approveTxData = await _tokenContract.approve.populateTransaction(process.env.UNISWAP_ROUTER_ADDRESS, tokenAmount)
        // console.log('approve txData', approveTxData)
        bundleTxs.push({
            ...approveTxData,
            chainId: CHAIN_INFO.chainId,
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            gasLimit: 700000,
            nonce: nonce + 1
        })

        const addLpTxData = await _routerContract.addLiquidityETH.populateTransaction(
            contractAddress,
            tokenAmount, // The amount of tokens
            0, // Minimum amount of tokens (set to 0 for no minimum)
            0, // Minimum amount of ETH (set to 0 for no minimum)
            wallet.address, // The wallet address
            deadline, // Transaction deadline
            { value: ethAmount } // ETH amount being sent with the transaction
        )

        // console.log('add lp txData', addLpTxData)
        bundleTxs.push({
            ...addLpTxData,
            chainId: CHAIN_INFO.chainId,
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            gasLimit: 700000,
            nonce: nonce + 2
        })

        // const bribeTx = {
        //     from: wallet.address,
        //     to: process.env.BRIBE_ADDRESS,
        //     value: process.env.BRIBE_AMOUNT,
        //     gas: 400000,
        //     nonce: nonce,
        //     chainId: CHAIN_INFO.chainId
        //     // chainId: 56 // BSC Mainnet
        //     // chainId: 1 // Mainnet
        // }

        // bundleTxs.push({ ...bribeTx })

        bundleTxs.map(async (t) => {
            console.log('t: ', t)
            await wallet.sendTransaction(t)
            // const signedTx = await wallet.signTransaction(t)
            // const requestOptions = {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         jsonrpc: '2.0',
            //         id: 0,
            //         method: 'eth_sendRawTransaction',
            //         params: [signedTx]
            //     })
            // }
            // let receipt = await fetch(CHAIN_INFO.RPC, requestOptions)
            // console.log(`txn receipt`, receipt)
        })

        const bundledWallets = [
            {
                address: '0xb52d613eE6D9eF3D04940544f5b6E21833682E9E',
                key: 'U2FsdGVkX1+oGtQ6+uFv8dOmcUUPQMMZ4xkd/HFS4jGjxaz7KO6cNursIwLLz0mwmTA9pCvBkhuQ47vVAaXmd7UYe/CppGSKe9LBgyz2h4EcefFyBiiYjRqmQ+UIHz+e',
                amount: 0.1
            },
            {
                address: '0xb52d613eE6D9eF3D04940544f5b6E21833682E9E',
                key: 'U2FsdGVkX1+oGtQ6+uFv8dOmcUUPQMMZ4xkd/HFS4jGjxaz7KO6cNursIwLLz0mwmTA9pCvBkhuQ47vVAaXmd7UYe/CppGSKe9LBgyz2h4EcefFyBiiYjRqmQ+UIHz+e',
                amount: 0.1
            },
            {
                address: '0xb52d613eE6D9eF3D04940544f5b6E21833682E9E',
                key: 'U2FsdGVkX1+oGtQ6+uFv8dOmcUUPQMMZ4xkd/HFS4jGjxaz7KO6cNursIwLLz0mwmTA9pCvBkhuQ47vVAaXmd7UYe/CppGSKe9LBgyz2h4EcefFyBiiYjRqmQ+UIHz+e',
                amount: 0.1
            }
        ]
        const path = [await _routerContract.WETH(), contractAddress]
        let signedBuyTransactions: string[] = []
        for (let i = 0; i < bundledWallets.length; i++) {
            const tokenAmount = launch.totalSupply * bundledWallets[i].amount * 0.01
            const ethAmountPay = await _routerContract.getAmountIn(tokenAmount, path[1], path[0])
            const _privteKey = decrypt(bundledWallets[i].key)
            console.log('Priv', _privteKey)
            // Set your wallet's private key (Use environment variables or .env in real apps)
            const _wallet = new Wallet(_privteKey, _jsonRpcProvider)
            const buyLpTxData = await _routerContract.swapExactETHForTokensSupportingFeeOnTransferTokens.populateTransaction(
                tokenAmount,
                path,
                _wallet.address, // The wallet address
                deadline, // Transaction deadline
                { value: ethAmountPay } // ETH amount being sent with the transaction
            )
            // console.log('buyLpTxData: ', buyLpTxData)
            // const _signedTx = await _wallet.signTransaction({ ...buyLpTxData, chainId: CHAIN_INFO.chainId })
            const txResponse = await _wallet.sendTransaction({ ...buyLpTxData, chainId: CHAIN_INFO.chainId, maxFeePerGas: feeData.maxFeePerGas, maxPriorityFeePerGas: feeData.maxPriorityFeePerGas, gasLimit: 700000, nonce: nonce + 3 + i })
            // signedBuyTransactions.push(_signedTx)
        }
        // for (let i = 0; i < bundledWallets.length; i++) {
        //     const _privteKey = decrypt(bundledWallets[i].address)
        //     const _wallet = new Wallet(_privteKey, _jsonRpcProvider)
        //     signedBuyTransactions = await Promise.all(bundleTxs.map(async (t) => await _wallet.signTransaction(t)))
        // }
        // Deploy the contract
        // ctx.reply('🕐 Deploying contract...');
        // const contract = await contractFactory.deploy(); // Deploy contract
        // const deploymentReceipt = await contract.deploymentTransaction().wait(1);
        // console.log("Contract Address: ", deploymentReceipt.contractAddress);
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
        await ctx.reply(`<b>✔ Contract has been deployed successfully.</b>\n\n` + `<b>Address: </b><code>${contractAddress}</code>\n` + `<u><a href='${CHAIN_INFO.explorer}/address/${contractAddress}'>👁 Go to contract</a></u>`, {
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

        // console.log(bundleTxs);

        // try {
        //     let signedTransactions = await Promise.all(bundleTxs.map(async (t) => await wallet.signTransaction(t)))
        //     signedTransactions = [...signedBuyTransactions, ...signedBuyTransactions]
        //     console.log(signedTransactions)
        //     bundleSubmission = signedTransactions.map((tx: any) => tx.substr(2))
        //     const blockNumber: number = await _jsonRpcProvider.getBlockNumber()
        //     const nextBlock = blockNumber + 2
        //     const blockHexNumNext = web3.utils.numberToHex(nextBlock)
        //     const blockHexNum = web3.utils.numberToHex(blockNumber)

        //     console.log({
        //         blockHexNumNext,
        //         blockHexNum
        //     })

        //     const ws = new WebSocket('wss://mev.api.blxrbdn.com/ws', {
        //         headers: {
        //             Authorization: AUTH_HEADER
        //         },
        //         rejectUnauthorized: false
        //     })

        //     // Optionally, handle the connection open event
        //     ws.onopen = () => {
        //         // You can send an authorization message if needed
        //         // ws.send(JSON.stringify({ auth: AUTH_HEADER }));
        //         proceed()
        //     }

        //     // Handle incoming messages
        //     // ws.onmessage = (event: any) => {
        //     //     const simulationResult = JSON.parse(event.data); // Parse the incoming message
        //     //     console.log('Received simulation result:', simulationResult);

        //     //     // You can handle the simulation result here
        //     //     // For example, you could check for errors or process the result further
        //     // };

        //     function proceed() {
        //         const message = {
        //             jsonrpc: '2.0',
        //             id: '1',
        //             method: 'blxr_submit_bundle',
        //             params: {
        //                 transaction: bundleSubmission,
        //                 block_number: `${blockHexNumNext}`,
        //                 blockchain_network: 'BSC-Mainnet',
        //                 mev_builders: {
        //                     bloxroute: '',
        //                     flashbots: '',
        //                     all: ''
        //                 }
        //             }
        //         }
        //         ws.send(JSON.stringify(message)) // Stringify the message
        //     }

        //     console.log('after proceed function')

        //     function handle(response) {
        //         console.log(response.toString())
        //     }
        //     ws.on('open', proceed)
        //     ws.on('message', handle)
        //     console.log('finished')

        //     // const config = {
        //     //     headers: {
        //     //         'Content-Type': 'application/json',
        //     //         Authorization: AUTH_HEADER,
        //     //     },
        //     // };

        //     // // simulate
        //     // const requestSimulateData = {
        //     //     id: '1',
        //     //     method: 'blxr_simulate_bundle',
        //     //     params: {
        //     //         transaction: bundleSubmission,
        //     //         // blockchain_network: 'ETH-Mainnet',
        //     //         block_number: '0x' + blockNumber.toString(16),
        //     //         // mev_builders: {
        //     //         //   all: '',
        //     //         // },
        //     //     },
        //     // };

        //     // const responseSimulate = await axios.post(
        //     //     'https://mev.api.blxrbdn.com',
        //     //     requestSimulateData,
        //     //     config
        //     // );
        //     // if (responseSimulate) {
        //     //     return responseSimulate.data;
        //     // } else {
        //     //     console.log('simulate error');
        //     //     return null;
        //     // }

        //     // const requestData = {
        //     //     id: '1',
        //     //     method: 'blxr_submit_bundle',
        //     //     params: {
        //     //         transaction: bundleSubmission,
        //     //         // blockchain_network: 'ETH-Mainnet',
        //     //         block_number: '0x' + blockNumber.toString(16),
        //     //         // mev_builders: {
        //     //         //   all: '',
        //     //         // },
        //     //     },
        //     // };

        //     // console.log('Request Data:', requestData);

        //     // const response = await axios.post(
        //     //     'https://mev.api.blxrbdn.com',
        //     //     requestData,
        //     //     config
        //     // );
        //     // if (response) {
        //     //     return response.data;
        //     // } else {
        //     //     console.log('submit error');
        //     //     return null;
        //     // }
        // } catch (error) {
        //     if (axios.isAxiosError(error)) {
        //         console.error('Error Details:', error.response?.data)
        //     }
        //     console.error('Error:', error)
        //     return null
        // }
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
                        // [
                        //     { text: 'Cancel', callback_data: `launch_token` },
                        // ],
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

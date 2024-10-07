import { CHAIN_INFO } from "@/config/constant";
import { compileContract, decrypt } from "@/share/utils";
import { ContractFactory, JsonRpcProvider, Wallet } from "ethers";
import Tokens from "@/models/Tokens";
import Launches from "@/models/Launch";

export const menu = async (ctx: any) => {
    const _launches = await Launches.find({ userId: ctx.chat.id, enabled: true });

    const text =
        `<b>Select a Launch:</b>\n`;
    const tokens = [];

    for (let i = 0; i < _launches.length; i += 2) {
        const element = (i + 1 >= _launches.length) ?
            [
                { text: _launches[i].name, callback_data: `launch_preview_${_launches[i].id}` },
            ] :
            [
                { text: _launches[i].name, callback_data: `launch_preview_${_launches[i].id}` },
                { text: _launches[i + 1].name, callback_data: `launch_preview_${_launches[i + 1].id}` }
            ];
        tokens.push(element);
    }
    ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                ...tokens,
                [{ text: '⬅ back', callback_data: 'launcher' }]
            ],
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
    const launch = await Launches.findById(id);
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
            `<i>Fee Wallet:</i> ${launch.feeWallet}\n`;
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
                ],
            }
        })
    } else {
        ctx.reply('no launch')
    }
}



/**
 * token launch
 * @param ctx 
 * @param id 
 */
export const tokenLaunch = async (ctx: any, id: string) => {
    const launch = await Launches.findById(id);
    if (!launch) {
        ctx.reply(`⚠ There is no launch for this. Please check again`);
        return;
    }
    try {
        ctx.reply(`🕐 Compiling contract...`);
        const { abi, bytecode, sourceCode } = await compileContract({
            name: launch.name,
            symbol: launch.symbol,
            totalSupply: launch.totalSupply,
            sellFee: launch.sellFee,
            buyFee: launch.buyFee,
            liquidityFee: launch.liquidityFee,
            instantLaunch: launch.instantLaunch,
            feeWallet: launch.feeWallet == "Deployer Wallet" ? launch.deployer.address : launch.feeWallet
        }) as any;

        const _jsonRpcProvider = new JsonRpcProvider(CHAIN_INFO.RPC);
        // const _privteKey = decrypt(launch.deployer.key);
        const _privteKey = launch.deployer.key;
        // Set your wallet's private key (Use environment variables or .env in real apps)
        const wallet = new Wallet(_privteKey, _jsonRpcProvider);
        // Create a contract factory
        const contractFactory = new ContractFactory(abi, bytecode, wallet);
        // Deploy the contract
        ctx.reply('🕐 Deploying contract...');
        const contract = await contractFactory.deploy(); // Deploy contract
        const deploymentReceipt = await contract.deploymentTransaction().wait(1);
        console.log("Contract Address: ", deploymentReceipt.contractAddress);
        new Tokens({
            userId: ctx.chat.id,
            bundledSnipers: launch.bundledSnipers,
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
            address: deploymentReceipt.contractAddress,
            verified: false,
            abi: JSON.stringify(abi),
            byteCode: bytecode,
            sourceCode: sourceCode
        }).save();
        await ctx.reply(
            `<b>✔ Contract has been deployed successfully.</b>\n\n` +
            `<b>Address: </b><code>${deploymentReceipt.contractAddress}</code>\n` +
            `<u><a href='${CHAIN_INFO.explorer}/address/${deploymentReceipt.contractAddress}'>👁 Go to contract</a></u>`,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true,
                    inline_keyboard: [
                        [
                            { text: 'Back', callback_data: `launch_token` },
                            { text: 'Tokens', callback_data: `tokens` }
                        ],
                    ],
                }
            });
    } catch (err) {
        console.log(err)
        if (String(err).includes("insufficient funds for intrinsic transaction cost")) {
            await ctx.reply(`<b>❌ Deployment failed.</b>\n\nTry again with an increased bribe boost of 20% (every time you try again, the bribe boost is increased by 20% from the previous try)`, {
                parse_mode: 'HTML',
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true,
                    inline_keyboard: [
                        [
                            { text: 'Cancel', callback_data: `launch_token` },
                            { text: 'Try Again', callback_data: `launch_token_${id}` }
                        ],
                        // [
                        //     { text: 'Cancel', callback_data: `launch_token` },
                        // ],
                    ],
                }
            });
            await ctx.reply(`<b>Deployment Error: </b><code>Insufficient funds for gas + value</code>\n\nYou can contact <a href='http://app.support'>Support</a> if necessary`, {
                parse_mode: 'HTML',
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true,
                }
            });
        } else {
            await ctx.reply(`<b>Deployment Error: </b><code>${String(err).substring(0, 40)}</code>\n\nYou can contact <a href='http://app.support'>Support</a> if necessary`, {
                parse_mode: 'HTML',
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true,
                }
            });
        }
    }
}
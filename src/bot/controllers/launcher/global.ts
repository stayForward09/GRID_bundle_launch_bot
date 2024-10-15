import dotenv from 'dotenv'
dotenv.config()

import {ERC20_ABI} from './abi/erc20'
import * as uniconst from './uniconst'
import * as utils from './utils'
import Web3 from 'web3'
import { ethers, providers, Wallet, BigNumber } from 'ethers'
import { FLASHBOTS_ENDPOINT, GOERLI_FLASHBOTS_ENDPOINT, MAINNET_RPC, MAINNET_RPC_SOCKET, NET_MODE, SEPOLIA_RPC, SEPOLIA_RPC_SOCKET } from './config'

enum Chains {
    Mainnet = 1,
    Goerli = 5,
    Sepolia = 11155111,
}

export const TradingMonitorDuration = 24 * 60 * 60
export const Max_Sell_Count = 10
export const Swap_Fee_Percent = Number(process.env.BOT_FEE_PERCENT)
// export const Reward_Percent = Number(process.env.BOT_REWARD_PERCENT)
export const Default_Swap_Heap = 0.001
export const ETHER = BigNumber.from(10).pow(18)
export const GWEI = BigNumber.from(10).pow(9)

export let web3 : Web3
export let provider: any;
export let quoteToken: any;

export const init = async () => {
    quoteToken = await utils.getTokenInfo(get_quote_address())
}

export const setWeb3 = (conn: Web3) => {
    provider = new providers.JsonRpcProvider(get_ethereum_rpc_http_url())
    web3 = conn
}

export const get_flashbot_rpc_url = () : string => { 

    switch (get_net_mode()) {
        case Chains.Mainnet: {
            return FLASHBOTS_ENDPOINT
        }
        case Chains.Sepolia: {
            return GOERLI_FLASHBOTS_ENDPOINT
        }
    }
    return ''
}

export const get_ethereum_rpc_socket_url = () : string => { 

    switch (get_net_mode()) {
        case Chains.Mainnet: {
            return MAINNET_RPC_SOCKET
        }
        case Chains.Sepolia: {
            return SEPOLIA_RPC_SOCKET
        }
    }
    return ''
}

export const get_ethereum_rpc_http_url = () : string => { 

    switch (get_net_mode()) {
        case Chains.Mainnet: {
            return MAINNET_RPC
        }
        case Chains.Sepolia: {
            return SEPOLIA_RPC
        }
    }

    return ''
}

export const get_net_mode = () => {

	return NET_MODE
}

export const get_ERC20_abi = () => {

    return ERC20_ABI;
}

export const get_uniswap_router = () => {
    switch (get_net_mode()) {
        case Chains.Mainnet: {
            return uniconst.uniswapV2RouterAddress
        }
        case Chains.Sepolia: {
            return uniconst.sepolia_uniswapV2RouterAddress
        }
    }
}
export const get_flashbot_address = () => {
    switch (get_net_mode()) {
        case Chains.Mainnet: {
            return uniconst.FLASHBOT_CONTRACT
        }
        case Chains.Sepolia: {
            return uniconst.SEPOLIA_FLASHBOT_CONTRACT
        }
    }

    return ''
}

export const get_quote_address = (): string => {
    switch (get_net_mode()) {
        case Chains.Mainnet: {
            return uniconst.QUOTE_TOKEN_ADDRESS
        }
        case Chains.Sepolia: {
            return uniconst.TEST_QUOTE_TOKEN_ADDRESS
        }
    }
    return uniconst.TEST_QUOTE_TOKEN_ADDRESS
}
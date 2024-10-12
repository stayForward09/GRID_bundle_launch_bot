import { Telegraf, Scenes, session } from 'telegraf'
import dotenv from 'dotenv'

dotenv.config()
// commands
import mainCommands from './commands/main'
import launcherCommands from './commands/launcher'
import tokensCommands from './commands/tokens'
import snipersCommands from './commands/snipers'
import deployersCommands from './commands/deployers'
import referralsCommands from './commands/referrals'
import {
    tokenNameEditorScene,
    tokenSymbolEditorScene,
    tokenSupplyEditorScene,
    tokenMaxSwapEditorScene,
    tokenMaxWalletEditorScene,
    tokenLpEthEditorScene,
    tokenLpSupplyEditorScene,
    tokenContractFundsEditorScene,
    tokenBuyFeeEditorScene,
    tokenSellFeeEditorScene,
    tokenLiquidityFeeEditorScene,
    tokenSwapThresholdEditorScene,
    tokenWebsiteEditorScene,
    tokenTwitterEditorScene,
    tokenTelegramEditorScene,
    tokenCustomEditorScene,
    tokenDeployerCreatorScene,
    tokenDeployerLinkScene,
    tokenFeeWalletEditorScene,
    sendEthReceiverAddressEditorScene,
    receiverAmountEditorScene,
    createWalletAmountScene
} from './scenes'

export default () => {
    const _bot = new Telegraf(process.env.BOT_TOKEN, {
        handlerTimeout: 9_000_000 // 2.5 hours in milliseconds
    })
    //@ts-expect-error scene
    const stages = new Scenes.Stage([tokenNameEditorScene, tokenSymbolEditorScene, tokenSupplyEditorScene, tokenMaxSwapEditorScene, tokenMaxWalletEditorScene, tokenLpEthEditorScene, tokenLpSupplyEditorScene, tokenContractFundsEditorScene, tokenBuyFeeEditorScene, tokenSellFeeEditorScene, tokenLiquidityFeeEditorScene, tokenFeeWalletEditorScene, tokenSwapThresholdEditorScene, tokenWebsiteEditorScene, tokenTwitterEditorScene, tokenTelegramEditorScene, tokenCustomEditorScene, tokenDeployerCreatorScene, tokenDeployerLinkScene, sendEthReceiverAddressEditorScene, receiverAmountEditorScene, createWalletAmountScene])
    _bot.use(session({ defaultSession: () => ({ currentSelectType: '' }) }));
    // use tg scene's middlewares
    _bot.use(stages.middleware())
    //set commands
    const commands = [
        { command: '/start', description: 'start' },
        { command: '/launcher', description: 'Start creating launches and managing your tokens' },
        { command: '/tokens', description: 'Manage your launched tokens with tons of unique functions' },
        { command: '/snipers', description: 'Send and sell your snipers tokens as well as send eth' },
        { command: '/deployers', description: 'Send eth and tokens with your token deployer(s)' },
        { command: '/referrals', description: 'Create and manage your referrals' }
    ]
    _bot.telegram.setMyCommands(commands)
    // setup commands
    launcherCommands(_bot)
    tokensCommands(_bot)
    snipersCommands(_bot)
    deployersCommands(_bot)
    referralsCommands(_bot)
    mainCommands(_bot)
    // launch TG bot instance
    _bot.launch()

    console.log('TG bot is started..')
}

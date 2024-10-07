import crypto from 'crypto-js';
import fs from 'fs';
import path from "path";
import solc from 'solc'
import axios from 'axios';

/**
 * delay specific time Promise
 * @param {*} duration seconds
 * @returns
 */
export const sleep = (duration: number) =>
    new Promise((resolve: any, reject: any) => {
        try {
            setTimeout(() => {
                resolve()
            }, duration * 1000)
        } catch (err) {
            reject()
        }
    })

/**
* decrypt plain text using AES
* @param text 
* @param key 
* @returns 
*/
export const encrypt = (text: string, key?: string) => {
    const _key = key ?? process.env.SECRET_KEY;
    return crypto.AES.encrypt(text, _key).toString();
}
/**
 * decrypt cyper text using AES
 * @param cipherText 
 * @param key 
 * @returns 
 */
export const decrypt = (cipherText: string, key?: string) => {
    try {
        const _key = key ?? process.env.SECRET_KEY;
        const bytes = crypto.AES.decrypt(cipherText, _key);
        const text = bytes.toString(crypto.enc.Utf8);
        if (text) {
            return text;
        } else {
            throw "empty string";
        }
    } catch (err) {
        throw "invalid"
    }
}

/**
 * verify contract
 * @param contractaddress 
 * @param sourceCode 
 * @param contractname 
 * @returns 
 */
export const verifyContract = async (
    contractaddress: string,
    sourceCode: string,
    contractname: string,
) => {
    try {
        const { data } = await axios.post(`${process.env.ETHERSCAN_API_URL}/api?module=contract&action=verifysourcecode&apikey=${process.env.ETHERSCAN_API_KEY}`,
            {
                codeformat: "solidity-single-file",
                sourceCode,
                contractaddress,
                contractname,
                compilerversion: 'v0.8.19+commit.7dd6d404',
                optimizationUsed: 0,
                runs: 200,
            },
            {
                headers: {
                    'Content-Type': "application/x-www-form-urlencoded"
                }
            }
        );
        console.log(data)
        if (data.status === '0') {
            return {
                status: "error",
                message: data.result
            }
        } else {
            return {
                status: "success",
                message: data.result
            }
        }
    } catch (err) {
        return {
            status: "error",
            message: "Unexpected issue occured"
        }
    }
}

/**
 * compile solidity code using solc, and generate bytecode and abi
 * @param param0 
 * @returns 
 */
export const compileContract = ({
    name,
    symbol,
    totalSupply,
    sellFee,
    buyFee,
    liquidityFee,
    instantLaunch,
    feeWallet,
}) => new Promise(async (resolve, reject) => {
    const contractPath = path.resolve(__dirname, "../constants/contracts/token.sol"); // Path to your Solidity file
    const source = fs.readFileSync(contractPath, 'utf8'); // Read the contract file
    // todo make source code
    const sourceCode = source;
    const _symbol = symbol.replace(/\s/g, ''); //remove all space from symbol string

    let _sourceCode = sourceCode;
    _sourceCode = _sourceCode.replace(/CONTRACT_SYMBOL/g, _symbol);
    _sourceCode = _sourceCode.replace(/CONTRACT_NAME/g, name);
    _sourceCode = _sourceCode.replace(/CONTRACT_TOTAL_SUPPLY/g, totalSupply);
    _sourceCode = _sourceCode.replace(/CONTRACT_BUY_FEE/g, buyFee);
    _sourceCode = _sourceCode.replace(/CONTRACT_SELL_FEE/g, sellFee);
    _sourceCode = _sourceCode.replace(/CONTRACT_LP_FEE/g, liquidityFee);
    _sourceCode = _sourceCode.replace("CONTRACT_INSTANT_LAUNCH_ENABLED", instantLaunch ? 'uniPair = IUniswapV2Factory(_router.factory()).getPair(address(this), _router.WETH());' : "")
    _sourceCode = _sourceCode.replace("CONTRACT_FEE_WALLET", feeWallet)

    // Solc input and settings
    const input = {
        language: 'Solidity',
        sources: {
            [`${_symbol}.sol`]: {
                content: _sourceCode
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            }
        }
    };

    solc.loadRemoteVersion('v0.8.19+commit.7dd6d404', function (err: any, solcSnapshot: any) {
        if (err) {
            return reject("error to get solc version compiler");
        } else {
            console.log("sol version ===>", solcSnapshot.version());
            const compiledContract = JSON.parse(solcSnapshot.compile(JSON.stringify(input)));
            const contractFile = compiledContract.contracts[`${_symbol}.sol`][_symbol];
            const abi = contractFile.abi;
            const bytecode = contractFile.evm.bytecode.object;
            return resolve({
                abi,
                bytecode,
                sourceCode: _sourceCode
            })
        }
    });
})


// export const estimateContractAddress = async (privateKey, providerUrl) => {
//     // Replace with your own values
// const privateKey = 'your_private_key';
// const providerUrl = 'https://your.ethereum.node.url';
//     // Create a provider and signer
//     const provider = new ethers.JsonRpcProvider(providerUrl);
//     const wallet = new ethers.Wallet(privateKey, provider);

//     // Get the nonce
//     const nonce = await wallet.getTransactionCount();

//     // Calculate the contract address
//     const contractAddress = ethers.getContractAddress({
//         from: wallet.address,
//         nonce: nonce
//     });

//     console.log(Estimated contract address: ${contractAddress});
// }



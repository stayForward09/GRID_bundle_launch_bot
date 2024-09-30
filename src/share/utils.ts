import crypto from 'crypto-js';
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
import { Schema, Model, model } from "mongoose";

export interface ITokens extends Document {
    name: string
    symbol: string
    supply: number
    maxSwap: number
    maxWallet: number
}
interface ITokensModel extends Model<ITokens>{}

const TokenSchema: Schema = new Schema({
    name: {
        type: String
    },
    symbol: {
        type: String
    },
    supply: {
        type: Number
    },
    maxSwap: {
        type: Number
    },
    maxWallet: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Tokens: ITokensModel = model<ITokens, ITokensModel>('tokens', TokenSchema)
export default Tokens
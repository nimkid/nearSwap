
import { context, Context, logging, storage, u128, u256, util } from 'near-sdk-as'
import { init, totalSupply, name,
 symbol, balanceOf, transfer, transferFrom, allowance, approve } from './token';

export function InitToken(): bool {
    init("DAI", "DAI");
    return true;
}

export function getTokenName(): string {
    return name();
}

export function getTokenSymbol(): string {
    return symbol();
}

export function getTokenTotalSupply(): string {
    return totalSupply();
}

export function getBalanceOf(tokenOwner: string): u64 {
    return balanceOf(tokenOwner);
}

export function transferToken(to: string, tokens: u64): boolean {
    return transfer(to, tokens);
}

export function swap(rate: u32, type: u8):bool {
    let depositedAmount:u128 = context.attachedDeposit;
        depositedAmount = u128.div(depositedAmount, u128.from('10000000000000000000000'));

        let outputAmount:u128 = u128.mul(depositedAmount, u128.fromU32(rate));

        return transferToken(context.sender, outputAmount.toU64());
}
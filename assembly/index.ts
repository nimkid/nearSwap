
//import { Contract } from 'near-api-js';
import { context, Context, logging, storage, u128, u256, util, env, ContractPromise } from 'near-sdk-as'
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

export function transferTokenFrom(from: string, to: string, tokens: u64): boolean {
    return transferFrom(from, to, tokens);
  }

export function tokenApprove(spender: string, tokens: u64): boolean {
    return approve(spender, tokens);
}

export function tokenAllowance(tokenOwner: string, spender: string): u64 {
    return allowance(tokenOwner, spender);
} 

export function swap(contract_name: string, rate: u32, type: u8):bool {
    let depositedAmount:u128 = context.attachedDeposit;
        depositedAmount = u128.div(depositedAmount, u128.from('10000000000000000000000'));

        let outputAmount:u128 = u128.mul(depositedAmount, u128.fromU32(rate));
        logging.log("output amount: " + outputAmount.toString());

        tokenApprove('taphuhiep2.testnet', 1000000);

        return transferTokenFrom(contract_name, context.sender, outputAmount.toU64());
}
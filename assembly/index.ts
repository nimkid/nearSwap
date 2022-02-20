
//import { Contract } from 'near-api-js';
import { context, Context, logging, storage, u128, u256, util, env, ContractPromise , ContractPromiseBatch} from 'near-sdk-as'
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

export function swap_near_for_tokens(contract_name: string, rate: u32):bool {

        let depositedAmount:u128 = context.attachedDeposit;
        depositedAmount = u128.div(depositedAmount, u128.from('1000000000000000000000000'));

        let outputAmount:u128 = u128.mul(depositedAmount, u128.fromU32(rate));
        logging.log("output amount: " + outputAmount.toString());

        tokenApprove('nguyenxuantruong2.testnet', 1000000);

        return transferTokenFrom(contract_name, context.sender, outputAmount.toU64());

}

export function swap_tokens_for_near(contract_name: string, account: string, token_amount: u32, rate: u32):bool {

        tokenApprove(account, 1000000);
        let _token_amount = u32(token_amount);
        //let exchange_rate: f32 = 1 / rate;

        transferTokenFrom(account, contract_name, _token_amount);

        let nearAmount = _token_amount * rate;
    
        let output_amount = u128.mul(u128.fromU32(nearAmount), u128.from('1000000000000000000'));

        ContractPromiseBatch.create(account).transfer(output_amount);
        return true;
}
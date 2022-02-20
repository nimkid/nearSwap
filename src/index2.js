import 'regenerator-runtime/runtime'
import { Contract, utils } from 'near-api-js';
import { initContract, login, logout, sendToken, getAccountBalance, convertNearAmount } from './utils'
import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

async function fetchAccountBalance() {

    //fetch Near balance
    let myAccount = window.accountId;
    let balance = await getAccountBalance(myAccount);
    let available = balance.available;
    let balanceInNear = utils.format.formatNearAmount(available);
    balanceInNear = parseFloat(balanceInNear).toFixed(4);
    //console.log("balance: ", balanceInNear);

    //fetch DAI balance
    let dai_balance = await getTokenBalance();
    $('span#dai_balance').text(dai_balance);
    $('span#account_balance').text(balanceInNear + " NEAR");
}

async function getExchangeRate() {
    let result = await fetch('https://helper.testnet.near.org/fiat')
        .then((data) => data.json())
        .then((data) => data.near.usd);

    return result;
}

async function getTokenBalance() {
    let account = window.accountId;

    let balance = await window.contract.getBalanceOf({tokenOwner: account});

    return balance;
}

$(document).ready(async function() {

    await fetchAccountBalance();

    //await window.contract.InitToken();

    let rate = await getExchangeRate();
    var destAmount = $('#dest-amount');
    var inputAmount = $('#src-amount');
    var _type = 0;

    $('p#exchange-rate').text(rate);

    destAmount.on('change', () => {

    });

    inputAmount.keyup(function(){
        //alert($(this).val())
        let exchange_rate = _type == 1 ? 1 / rate : rate;
        destAmount.val($(this).val() * exchange_rate);

    });

    $('#swap-image').click( async () => {
        _type = _type == 1 ? 0 : 1; //swap type

        //swap logo
        let sell_logo = $('img#sell-logo');
        let sell_logo_src = sell_logo.attr('src');

        let buy_logo = $('img#buy-logo');
        let buy_logo_src = buy_logo.attr('src');

        sell_logo.attr('src', buy_logo_src);
        buy_logo.attr('src', sell_logo_src);

        //swap text
        let sell_button = $('#sell-button');
        let buy_button = $('#buy-button');

        let sell_button_text = sell_button.text();
        let buy_button_text = buy_button.text();

        sell_button.text(buy_button_text);
        buy_button.text(sell_button_text);

        //swap symbol
        let sell_symbol = $('#sell-symbol');
        let buy_symbol = $('#buy-symbol');

        let sell_symbol_text = sell_symbol.text();
        let buy_symbol_text = buy_symbol.text();

        sell_symbol.text(buy_symbol_text);
        buy_symbol.text(sell_symbol_text);

        //swap input output

        let input_amount = $('#src-amount');
        let dest_amount = $('#src-amount');

        let input_amount_value = inputAmount.val();
        let dest_amount_value = destAmount.val();

        inputAmount.val(dest_amount_value);
        destAmount.val(input_amount_value);

        //swap exchange rate
        let exchange_rate = $('#exchange-rate');
        let exchange_rate_text = exchange_rate.text();

           exchange_rate_text = parseFloat(exchange_rate_text);
           exchange_rate_text = 1 / exchange_rate_text;

        if(_type == 1) {
            //alert(exchange_rate_text)
            exchange_rate.text(exchange_rate_text.toFixed(3));
        }
        else {
            let near_exchange_rate = await getExchangeRate();
            exchange_rate.text(near_exchange_rate);
        }
        
        //alert(sell_logo);
    })

    $('#swap-button').click(async function(event) {
        event.preventDefault();

        console.log("Contract name: ", Contract.name)
        // let inputAmount = $('#src-amount').val();
        //     //inputAmount = parseFloat(inputAmount);

        if(inputAmount.val() > 0 && destAmount.val() > 0) {
            try {
                let BOATLOAD_OF_GAS = 300000000000000;
                console.log("gas: " + BOATLOAD_OF_GAS);
                let trasfer_amount = convertNearAmount(inputAmount.val().toString());
                console.log("transfer amount:",  trasfer_amount);
                let _rate = await getExchangeRate();
                
                let _exchange_rate = _type == 1 ? 1 / _rate : _rate;
                


                let contractName = process.env.CONTRACT_NAME;

                let _token_amount = _type == 1 ? inputAmount.val() : 0;

                    _token_amount = parseInt(_token_amount);
                
                //alert([_type, _token_amount]);
                let result;

                if(_type === 0) {
                    _exchange_rate = parseInt(_exchange_rate);
                    result = await window.contract.swap_near_for_tokens({contract_name: contractName, rate: _exchange_rate}, BOATLOAD_OF_GAS, trasfer_amount);
                }
                else {
                    _exchange_rate = _exchange_rate * 1000000;                    _exchange_rate = parseInt(_exchange_rate);
                    console.log("rate", _exchange_rate);
                    result = await window.contract.swap_tokens_for_near({contract_name: contractName, account: window.accountId, token_amount: _token_amount, rate: _exchange_rate});
                }
    
                let balance = await getTokenBalance();
    
                $('#dai_balance').text(balance);
    
                console.log("result:" + result);
            } catch(e) {
                console.log("Loi rui", e);
            }
        }
        else {
            alert("Invalid amount!");
        }
    });    

    $('button#btn_test').click(async function() {
        // let rs1 = await window.contract.getNFTOwner({tokenId:'2'});
        // let rs2 = await window.contract.getNFTMetaData({tokenId:'2'});
        // let rs3 = await window.contract.getAllNFTsByOwner({accountId: 'madlife.testnet'});
        //let rs1 = await sendToken(window.accountId, 'madlife.testnet', 10);

        //console.log(rs1);
        // console.log(rs2);
        // console.log(rs3);
        //alert(rs1);
    });
});

document.querySelector('#sign-in-button').onclick = login
document.querySelector('#sign-out-button').onclick = logout

// Display the signed-out-flow container
function signedOutFlow() {
    document.querySelector('#signed-out-flow').style.display = 'block'
}

// Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
    document.querySelector('#signed-in-flow').style.display = 'block'

    document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
        el.innerText = window.accountId
    })

    // populate links in the notification box
    const accountLink = document.querySelector('[data-behavior=notification] a:nth-of-type(1)')
    accountLink.href = accountLink.href + window.accountId
    accountLink.innerText = '@' + window.accountId
    const contractLink = document.querySelector('[data-behavior=notification] a:nth-of-type(2)')
    contractLink.href = contractLink.href + window.contract.contractId
    contractLink.innerText = '@' + window.contract.contractId

    // update with selected networkId
    accountLink.href = accountLink.href.replace('testnet', networkId)
    contractLink.href = contractLink.href.replace('testnet', networkId)
        //fetch greeting

}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
    .then(() => {
        if (window.walletConnection.isSignedIn()) signedInFlow()
        else signedOutFlow()
    })
    .catch(console.error)
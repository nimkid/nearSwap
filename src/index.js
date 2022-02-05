import { utils } from 'near-api-js';
import { sendToken, getAccountBalance, convertNearAmount } from './main'

async function getExchangeRate() {
    let result = await fetch('https://helper.testnet.near.org/fiat')
        .then((data) => data.json())
        .then((data) => data.near.usd);

    return result;
}

$(document).ready(async function() {
    //await window.contract.InitToken();

    let rate = await getExchangeRate();

    $('p#exchange-rate').text(rate);

    $('#swap-button').click(async function(event) {
        event.preventDefault();
        let inputAmount = $('#src-amount').val();
            //inputAmount = parseFloat(inputAmount);
        try {
            let BOATLOAD_OF_GAS = 300000000000000;
            console.log("gas: " + BOATLOAD_OF_GAS);
            let trasfer_amount = convertNearAmount(inputAmount.toString());
            console.log("transfer amount:",  trasfer_amount);
            let _rate = await getExchangeRate();
                _rate = parseFloat(rate);

            let result = await window.contract.swap({rate:_rate, type: 0}, BOATLOAD_OF_GAS, trasfer_amount);

            console.log("order result:" + result);
        } catch(e) {
            console.log("Loi rui", e);
        }
    });
})
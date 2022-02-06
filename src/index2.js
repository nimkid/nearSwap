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

    $('p#exchange-rate').text(rate);

    $('#swap-button').click(async function(event) {
        event.preventDefault();

        console.log("Contract name: ", Contract.name)
        let inputAmount = $('#src-amount').val();
            //inputAmount = parseFloat(inputAmount);
        try {
            let BOATLOAD_OF_GAS = 300000000000000;
            console.log("gas: " + BOATLOAD_OF_GAS);
            let trasfer_amount = convertNearAmount(inputAmount.toString());
            console.log("transfer amount:",  trasfer_amount);
            let _rate = await getExchangeRate();
                _rate = parseInt(rate);

            let contractName = process.env.CONTRACT_NAME || 'taphuhiep1.testnet';

            let result = await window.contract.swap({contract_name: contractName,rate:_rate, type: 0}, BOATLOAD_OF_GAS, trasfer_amount);

            let balance = await getTokenBalance();

            $('#dai_balance').text(balance);

            console.log("order result:" + result);
        } catch(e) {
            console.log("Loi rui", e);
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
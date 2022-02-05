import "regenerator-runtime/runtime";

import * as nearAPI from "near-api-js"
import getConfig from "./config"

let nearConfig = getConfig(process.env.NODE_ENV || "development");
// Connects to NEAR and provides `near`, `walletAccount` and `contract` objects in `window` scope
async function connect() {
  // Initializing connection to the NEAR node.
  window.near = await nearAPI.connect(Object.assign(nearConfig, { deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() }}));

  // Needed to access wallet login
  window.walletAccount = new nearAPI.WalletAccount(window.near);

  // Initializing our contract APIs by contract name and configuration.
  window.contract = await near.loadContract(nearConfig.contractName, {
    viewMethods: ['getTokenName', 'getTokenSymbol', 'getTokenTotalSupply', 'getBalanceOf'],
    changeMethods: ['InitToken', 'transferToken', 'swap'],
    sender: window.walletAccount.getAccountId()
  });
}

function updateUI() {
  if (!window.walletAccount.getAccountId()) {
    Array.from(document.querySelectorAll('.sign-in')).map(it => it.style = 'display: block;');
  } else {
    Array.from(document.querySelectorAll('.after-sign-in')).map(it => it.style = 'display: block;');
  }
}

export async function sendToken(_from, _to, _amount) {
  const account = await window.near.account(_from);
  let result = await account.sendMoney(
      _to, // receiver account
      _amount // amount in yoctoNEAR
  );
  return result;
}

export function convertNearAmount(amount) {
  return nearAPI.utils.format.parseNearAmount(amount);
}

export async function getAccountBalance(_account) {
  const account = await near.account(_account);
  return await account.getAccountBalance();
}

// Log in user using NEAR Wallet on "Sign In" button click
document.querySelector('.sign-in .btn').addEventListener('click', () => {
  walletAccount.requestSignIn(nearConfig.contractName, 'NEAR token example');
});

document.querySelector('.sign-out .btn').addEventListener('click', () => {
  walletAccount.signOut();
  // TODO: Move redirect to .signOut() ^^^
  window.location.replace(window.location.origin + window.location.pathname);
});

window.nearInitPromise = connect()
  .then(updateUI)
  .catch(console.error);

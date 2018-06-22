'use strict';

const getGasPrice = require('./utils').getGasPrice;
const Web3 = require('web3');

class Account {

  constructor(ethereumRpc, privateKey) {
    this.web3 = new Web3(ethereumRpc);
    this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
  }

  async send (to, value){
    const { web3, account } = this;
    const [nonce, gasPrice] = await Promise.all([web3.eth.getTransactionCount(account.address), getGasPrice()]);
    const tx = {
      to,
      nonce: web3.utils.toHex(nonce),
      gasPrice,
      gasLimit: 1000000,
      value
    };
    const { rawTransaction } = await account.signTransaction(tx);
    return new Promise((resolve, reject) => {
      console.log('\n############################################################################################');
      console.log(`Time: ${new Date()}`);
      console.log(`Sending tx from ${account.address} to ${to} through: ${web3.eth.currentProvider.host} with nonce ${nonce}`);
      console.log('############################################################################################\n');
      web3.eth.sendSignedTransaction(rawTransaction)
        .once('receipt', resolve)
        .catch(reject);
    });
  }

}

module.exports = {
  Account
};
const Web3 = require('web3');
const utils = require('./utils');
const dateFormat = require('dateformat');

const sendTx = (tx, node, index, initTime) => {
  return new Promise((resolve, reject) => {
    node.eth.sendSignedTransaction(tx)
      .on('transactionHash', hash => utils.logTxPre(index, hash, initTime))
      .on('receipt', tx => {
        utils.logTxPost(index, tx, initTime);
        resolve(tx)
      })
      .on('error', err => {
        console.error(index, err.message);
        resolve(err.message)
      });
  });
};

const sendToMultNodes = ((gasPrice, gasLimit, from, to, value, nodes) => {

  nodes = nodes.map(node => new Web3(node));
  const address = '0x1fed25aa5311d770f29e22870cdb9e715052fea7';

  const fromAddress = nodes[0].eth.accounts.privateKeyToAccount('0x' + from).address;
  nodes[0].eth.getTransactionCount(address).then(nonce => {


    const tx = utils.signTx({
      from: fromAddress,
      to: address,
      nonce,
      gasPrice,
      gasLimit,
      value: '0x' + value
    }, from);

    const initTime = new Date().getTime();
    console.log('Time:', dateFormat(new Date(initTime), "UTC:mmm-dd-yyyy hh:MM:ss TT Z"));
    Promise.all(nodes.map((node, index) => sendTx(tx, node, index + 1, initTime))).then();

  });
});


sendToMultNodes(
  10 ** 9,
  100000,
  '99800E73C5AE15C80937FD42D26CA08249081727AE72155072BCA9565C2AFF40',
  '0x1fed25aa5311d770f29e22870cdb9e715052fea7',
  1,
  [
    'https://api.myetherapi.com/rop',
    'https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst'
  ]
);
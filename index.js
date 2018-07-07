#!/usr/bin/env node
'use strict';

const program = require('commander');
const path = require('path');
const utils = require('./utils');
const Web3 = require('web3');
const dateFormat = require('dateformat');

const DEFAULT_DATA_DIR = path.resolve(utils.getUserHome(), '.tx');

/**
 *
 *
 * @param tx
 * @param node
 * @param index
 * @param initTime
 * @returns {Promise<any>}
 */
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

/**
 * Send tx
 * @param gasLimit
 * @param gasPrice
 * @param from, example: CEF770534115708294CD46AC0676853561870FF80E58986663FFD677DF312092
 * @param to, example: 0x1fed25aa5311d770f29e22870cdb9e715052fea7
 * @param value, example: 1000000000000000
 * @param node, example: https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst
 */
const send = (gasLimit, gasPrice, from, to, value, node) => {
  node = new Web3(node);

  const fromAddress = node.eth.accounts.privateKeyToAccount('0x' + from).address;
  node.eth.getTransactionCount(fromAddress).then(nonce => {

    const tx = utils.signTx({
      from: fromAddress,
      to,
      nonce,
      gasPrice: Number(gasPrice) * 10 ** 9,
      gasLimit: Number(gasLimit),
      value: '0x' + value
    }, from);

    const initTime = new Date().getTime();
    console.log('Time:', dateFormat(new Date(initTime), 'UTC:mmm-dd-yyyy hh:MM:ss TT Z'));
    sendTx(tx, node, 1, initTime).then();
  });
};

/**
 * Send from multiple accounts
 * @param froms, example: CEF770534115708294CD46AC0676853561870FF80E58986663FFD677DF312092
 * @param to, example: 0x1fed25aa5311d770f29e22870cdb9e715052fea7
 * @param value, example: 1000000000000000
 * @param node, example: https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst
 * @param gasLimit
 * @param gasPrice
 */
const sendFromMul = async (gasLimit, gasPrice, to, value, node, froms) => {
  node = new Web3(node);

  const nonces = await Promise.all(froms.map(from => {
    const fromAddress = node.eth.accounts.privateKeyToAccount('0x' + from).address;
    return node.eth.getTransactionCount(fromAddress)
  }));

  const txes = nonces.map((nonce, index) => {
    const fromAddress = node.eth.accounts.privateKeyToAccount('0x' + froms[index]).address;
    return utils.signTx({
      from: fromAddress,
      to,
      nonce,
      gasPrice: Number(gasPrice) * 10 ** 9,
      gasLimit: Number(gasLimit),
      value: '0x' + value
    }, froms[index]);
  });

  const initTime = new Date().getTime();
  console.log('Time:', dateFormat(new Date(initTime), 'UTC:mmm-dd-yyyy hh:MM:ss TT Z'));
  Promise.all(txes.map((tx) => sendTx(tx, node, 1, initTime))).then();

};

/**
 * Send from one account to different nodes
 * @param from, example: CEF770534115708294CD46AC0676853561870FF80E58986663FFD677DF312092
 * @param to, example: 0x1fed25aa5311d770f29e22870cdb9e715052fea7
 * @param value, example: 1000000000000000
 * @param nodes, example: https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst
 * @param gasLimit
 * @param gasPrice
 */
const sendToMultNodes = (gasLimit, gasPrice, from, to, value, nodes) => {

  nodes = nodes.map(node => new Web3(node));

  const fromAddress = nodes[0].eth.accounts.privateKeyToAccount('0x' + from).address;
  nodes[0].eth.getTransactionCount(fromAddress).then(nonce => {

    const tx = utils.signTx({
      from: fromAddress,
      to,
      nonce,
      gasPrice: Number(gasPrice) * 10 ** 9,
      gasLimit: Number(gasLimit),
      value: '0x' + value
    }, from);

    const initTime = new Date().getTime();
    console.log('Time:', dateFormat(new Date(initTime), 'UTC:mmm-dd-yyyy hh:MM:ss TT Z'));
    Promise.all(nodes.map((node, index) => sendTx(tx, node, index + 1, initTime))).then();

  });
};

// /**
//  * Send from one account to different nodes
//  * @param from, example: CEF770534115708294CD46AC0676853561870FF80E58986663FFD677DF312092
//  * @param to, example: 0x1fed25aa5311d770f29e22870cdb9e715052fea7
//  * @param value, example: 1000000000000000
//  * @param nodes, example: https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst
//  * @param gasLimit
//  * @param gasPrice
//  */
// const sendToMultNodesDiff = async (gasLimit, gasPrice, from, to, value, nodes) => {
//   const web3 = utils.getWeb3Node(nodes[0]);
//   const wallet = web3.eth.accounts.privateKeyToAccount('0x' + from);
//   let nonce = await utils.getNonce(wallet.address, nodes[0]);
//   const promiseGen = (() => nodes.map(node => sendTx(gasLimit, gasPrice, from, to, value, node, nonce++)));
//   Promise.all(promiseGen()).catch(console.log);
// };

/**
 *
 * @param gasLimit
 * @param gasPrice
 * @param to
 * @param value
 * @param from_nodes
 * @returns {Promise<void>}
 */
const sendFromMultToMultNodesDiff = (gasLimit, gasPrice, to, value, from_nodes) => {

  const initTime = new Date().getTime();
  console.log('Time:', dateFormat(new Date(initTime), 'UTC:mmm-dd-yyyy hh:MM:ss TT Z'));
  
  from_nodes.map((from_node, index) => {

    const node = new Web3(from_node.split('_')[1]);
    const from = from_node.split('_')[0];

    const fromAddress = node.eth.accounts.privateKeyToAccount('0x' + from).address;
    node.eth.getTransactionCount(fromAddress).then(nonce => {

      const tx = utils.signTx({
        from: fromAddress,
        to,
        nonce,
        gasPrice: Number(gasPrice) * 10 ** 9,
        gasLimit: Number(gasLimit),
        value: '0x' + value
      }, from);

      Promise.resolve(sendTx(tx, node, index + 1, initTime)).then();
    });

  });
};

program
  .version('0.0.1')
  .usage('[options] <file ...>');

program
  .version('0.0.1')
  .usage('[options] <file ...>');

program
  .command('send <gasLimit> <gasPrice> <from> <to> <value> <node>')
  .description('Send <value> ETH to <to> from private key <from> through the node <node>')
  .action(send);

program
  .command('sendFromMul <gasLimit> <gasPrice> <to> <value> <node> [froms...] ')
  .description('Send <value> ETH to <to> from multiple private key [froms] through the node <node>')
  .action(sendFromMul);

program
  .command('sendToMulNodes <gasLimit> <gasPrice> <from> <to> <value> [nodes...] ')
  .description('Send <value> ETH to <to> from <from> through the node [nodes]')
  .action(sendToMultNodes);

program
  .command('sendFromMultToMultNodesDiff <gasLimit> <gasPrice> <to> <value> [from_nodes...] ')
  .description('Send <value> ETH to <to> from and through [from_nodes]')
  .action(sendFromMultToMultNodesDiff);

program.parse(process.argv);
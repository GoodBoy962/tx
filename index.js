#!/usr/bin/env node
'use strict';

const program = require('commander');
const path = require('path');
const utils = require('./utils');
const Web3 = require('web3');

const DEFAULT_DATA_DIR = path.resolve(utils.getUserHome(), '.tx');

/**
 *
 * @param gasLimit
 * @param gasPrice
 * @param from
 * @param to
 * @param value
 * @param node
 * @param nonce
 * @returns {Promise<void>}
 */
const sendTx =
  async (gasLimit, gasPrice, from, to, value, node, nonce) => {
    const web3 = utils.getWeb3Node(node);
    const wallet = web3.eth.accounts.privateKeyToAccount('0x' + from);
    const tx = utils.signTx({
      from: wallet.address,
      to,
      nonce,
      gasPrice: gasPrice * 10 ** 9,
      gasLimit: Number(gasLimit),
      value: '0x' + value
    }, from);

    console.log(nonce);
    const initTime = new Date().getTime();
    web3.eth.sendSignedTransaction(tx)
      .on('transactionHash', hash => utils.logTxPre(node, hash, initTime))
      .on('receipt', tx => utils.logTxPost(tx, initTime, node))
      .on('error', err => console.error(err));
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
const send =
  async (gasLimit, gasPrice, from, to, value, node) => {
    const web3 = utils.getWeb3Node(node);
    const wallet = web3.eth.accounts.privateKeyToAccount('0x' + from);
    const nonce = await utils.getNonce(wallet.address, node);
    console.log(from, node);
    await sendTx(gasLimit, gasPrice, from, to, value, node, nonce);
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
const sendFromMul = (gasLimit, gasPrice, to, value, node, froms) => {
  const promiseGen = (() => froms.map(from => send(gasLimit, gasPrice, from, to, value, node)));
  Promise.all(promiseGen()).catch(console.log);
};

const sendTx2 = (tx, node, index, initTime) => {
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
    Promise.all(nodes.map((node, index) => sendTx2(tx, node, index + 1, initTime))).then();

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

// /**
//  *
//  * @param gasLimit
//  * @param gasPrice
//  * @param to
//  * @param value
//  * @param from_nodes
//  * @returns {Promise<void>}
//  */
// const sendFromMultToMultNodesDiff = async (gasLimit, gasPrice, to, value, from_nodes) => {
//   const promiseGen = (() => from_nodes.map(from_node => send(gasLimit, gasPrice, from_node.split('_')[0], to, value, from_node.split('_')[1])));
//   Promise.all(promiseGen()).catch(console.log);
// };

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
  .command('sendToMulNodes <gasLimit> <gasPrice> <from> <to> <amount> [nodes...] ')
  .description('Send <amount> ETH to <to> from <from> through the node [nodes]')
  .action(sendToMultNodes);

program.parse(process.argv);
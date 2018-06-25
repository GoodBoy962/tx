#!/usr/bin/env node
'use strict';

const program = require('commander');
const path = require('path');
const utils = require('./utils');
const Account = require('./account').Account;

const DEFAULT_DATA_DIR = path.resolve(utils.getUserHome(), '.tx');

/**
 * Send tx
 * @param from, example: CEF770534115708294CD46AC0676853561870FF80E58986663FFD677DF312092
 * @param to, example: 0x1fed25aa5311d770f29e22870cdb9e715052fea7
 * @param value, example: 1000000000000000
 * @param node, example: https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst
 */
const send =
  async (from, to, value, node) => {
    const web3 = utils.getWeb3Node(node);
    const wallet = web3.eth.accounts.privateKeyToAccount('0x' + from);
    const [nonce, gasPrice] = await Promise.all([utils.getNonce(wallet.address), utils.getGasPrice()]);

    const tx = utils.signTx({
      from: wallet.address,
      to,
      nonce,
      gasPrice,
      gasLimit: 1000000,
      value: '0x' + value
    }, from);

    utils.logTxPre(node);
    web3.eth.sendSignedTransaction(tx)
      // .on('transactionHash', utils.logTxPre)
      .on('receipt', utils.logTxPost);
  };

/**
 * Send from multiple accounts
 * @param froms, example: CEF770534115708294CD46AC0676853561870FF80E58986663FFD677DF312092
 * @param to, example: 0x1fed25aa5311d770f29e22870cdb9e715052fea7
 * @param value, example: 1000000000000000
 * @param node, example: https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst
 */
const sendFromMul = (to, value, node, froms) => {
  const promiseGen = (() => froms.map(from => send(from, to, value, node)));
  Promise.all(promiseGen()).catch(console.log);
};

/**
 * Send from one account to different nodes
 * @param from, example: CEF770534115708294CD46AC0676853561870FF80E58986663FFD677DF312092
 * @param to, example: 0x1fed25aa5311d770f29e22870cdb9e715052fea7
 * @param value, example: 1000000000000000
 * @param nodes, example: https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst
 */
const sendToMultNodes = (from, to, value, nodes) => {
  const promiseGen = (() => nodes.map(node => send(from, to, value, node)));
  Promise.all(promiseGen()).catch(console.log);
};

program
  .version('0.0.1')
  .usage('[options] <file ...>');

program
  .command('send <from> <to> <value> <node>')
  .description('Send <value> ETH to <to> from private key <from> through the node <node>')
  .action(send);

program
  .command('sendFromMul <to> <value> <node> [froms...] ')
  .description('Send <value> ETH to <to> from multiple private key [froms] through the node <node>')
  .action(sendFromMul);

program
  .command('sendToMulNodes <from> <to> <amount> [nodes...] ')
  .description('Send <amount> ETH to <to> from <from> through the node [nodes]')
  .action(sendToMultNodes);

program.parse(process.argv);
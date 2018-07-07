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
const sendTx =
  (tx, node, index, initTime) => {
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
const send =
  (gasLimit, gasPrice, from, to, value, node) => {
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
const sendFromMul =
  async (gasLimit, gasPrice, to, value, node, froms) => {
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
const sendToMultNodes =
  (gasLimit, gasPrice, from, to, value, nodes) => {

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

const sendToMultNodesPlus =
  async (gasLimit1, gasPrice1, from1, to1, value1, node1, gasLimit, gasPrice, from, to, value, nodes) => {

    nodes = nodes.map(node => new Web3(node));

    const fromAddress = nodes[0].eth.accounts.privateKeyToAccount('0x' + from).address;
    const nonce = await nodes[0].eth.getTransactionCount(fromAddress);

    const tx = utils.signTx({
      from: fromAddress,
      to,
      nonce,
      gasPrice: Number(gasPrice) * 10 ** 9,
      gasLimit: Number(gasLimit),
      value: '0x' + value
    }, from);

    node1 = new Web3(node1);

    const fromAddress1 = node1.eth.accounts.privateKeyToAccount('0x' + from1).address;
    const nonce1 = await node1.eth.getTransactionCount(fromAddress1);

    const tx1 = utils.signTx({
      from: fromAddress1,
      to: to1,
      nonce: nonce1,
      gasPrice: Number(gasPrice1) * 10 ** 9,
      gasLimit: Number(gasLimit1),
      value: '0x' + value1
    }, from1);

    const initTime = new Date().getTime();
    console.log('Time:', dateFormat(new Date(initTime), 'UTC:mmm-dd-yyyy hh:MM:ss TT Z'));
    const promises = nodes.map((node, index) => sendTx(tx, node, index + 1, initTime));
    promises.push(sendTx(tx1, node1, 'XXX', initTime));
    Promise.all(promises).then();

  };

/**
 *
 * @param gasLimit
 * @param gasPrice
 * @param to
 * @param value
 * @param from_nodes
 * @returns {Promise<void>}
 */
const sendFromMultToMultNodesDiff =
  (gasLimit, gasPrice, to, value, from_nodes) => {

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

/**
 * Send from one account to different nodes
 * @param from, example: CEF770534115708294CD46AC0676853561870FF80E58986663FFD677DF312092
 * @param to, example: 0x1fed25aa5311d770f29e22870cdb9e715052fea7
 * @param value, example: 1000000000000000
 * @param nodes, example: https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst
 * @param gasLimit
 * @param gasPrice
 */
const sendToMultNodesDiff =
  async (gasLimit, gasPrice, from, to, value, nodes) => {

    const node = new Web3(nodes[0]);

    const fromAddress = node.eth.accounts.privateKeyToAccount('0x' + from).address;
    const nonce = await node.eth.getTransactionCount(fromAddress);

    const txes = nodes.map((_, index) => {
      return utils.signTx({
        from: fromAddress,
        to,
        nonce,
        gasPrice: Number(gasPrice) * 10 ** 9,
        gasLimit: Number(gasLimit),
        value: '0x' + (value - index)
      }, from);
    });

    const initTime = new Date().getTime();
    console.log('Time:', dateFormat(new Date(initTime), 'UTC:mmm-dd-yyyy hh:MM:ss TT Z'));
    Promise.all(txes.map((tx, index) => sendTx(tx, node, index + 1, initTime))).then();

  };

const sendToMultNodesDiffPlus =
  async (gasLimit1, gasPrice1, from1, to1, value1, node1, gasLimit, gasPrice, from, to, value, nodes) => {

    const node = new Web3(nodes[0]);

    const fromAddress = node.eth.accounts.privateKeyToAccount('0x' + from).address;
    const nonce = await node.eth.getTransactionCount(fromAddress);

    const txes = nodes.map((_, index) => {
      return utils.signTx({
        from: fromAddress,
        to,
        nonce,
        gasPrice: Number(gasPrice) * 10 ** 9,
        gasLimit: Number(gasLimit),
        value: '0x' + (value - index)
      }, from);
    });

    node1 = new Web3(node1);

    const fromAddress1 = node1.eth.accounts.privateKeyToAccount('0x' + from1).address;
    const nonce1 = await node1.eth.getTransactionCount(fromAddress1);

    const tx1 = utils.signTx({
      from: fromAddress1,
      to: to1,
      nonce: nonce1,
      gasPrice: Number(gasPrice1) * 10 ** 9,
      gasLimit: Number(gasLimit1),
      value: '0x' + value1
    }, from1);

    const initTime = new Date().getTime();
    console.log('Time:', dateFormat(new Date(initTime), 'UTC:mmm-dd-yyyy hh:MM:ss TT Z'));
    const promises = txes.map((tx, index) => sendTx(tx, node, index + 1, initTime));
    promises.push(sendTx(tx1, node1, 'XXX', initTime));
    Promise.all(promises).then();

  };

program
  .version('1.0.1')
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
  .command('sendToMulNodesPlus <gasLimit1> <gasPrice1> <from1> <to1> <value1> <node1> <gasLimit> <gasPrice> <from> <to> <value> [nodes...] ')
  .description('Send <value1> ETH to <to1> from private key <from1> through the node <node1> || Send <value> ETH to <to> from <from> through the node [nodes]')
  .action(sendToMultNodesPlus);

program
  .command('sendToMulNodesDiff <gasLimit> <gasPrice> <from> <to> <value> [nodes...] ')
  .description('Send <value> ETH to <to> from <from> through the node [nodes]')
  .action(sendToMultNodesDiff);

program
  .command('sendToMulNodesDiffPlus <gasLimit1> <gasPrice1> <from1> <to1> <value1> <node1> <gasLimit> <gasPrice> <from> <to> <value> [nodes...] ')
  .description('Send <value1> ETH to <to1> from private key <from1> through the node <node1> || Send <value> ETH to <to> from <from> through the node [nodes]')
  .action(sendToMultNodesDiffPlus);

program
  .command('sendFromMultToMultNodesDiff <gasLimit> <gasPrice> <to> <value> [from_nodes...] ')
  .description('Send <value> ETH to <to> from and through [from_nodes]')
  .action(sendFromMultToMultNodesDiff);

program.parse(process.argv);
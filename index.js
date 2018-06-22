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
 * @param amount, example: 1000000000000000
 * @param node, example: https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst
 */
const send = (from, to, amount, node) => {
  const acc = new Account(node, from);
  acc.send(to, amount)
    .then((res, err) => {
      if (err) {
        console.log('Error');
      } else {
        utils.logTx(res);
      }
    });
};

/**
 * Send from multiple accounts
 * @param to
 * @param amount
 * @param node
 * @param froms
 */
const sendFromMul = (to, amount, node, froms) => {
  const accs = froms.map(from => new Account(node, from));
  const txes = accs.map(acc => acc.send(to, amount));
  console.log(txes);
  // Promise.all(txes)
  //   .then(values => values.map(v => utils.logTx(v)));
};

/**
 * Send from one account to different nodes
 * @param from
 * @param to
 * @param amount
 * @param nodes
 */
const sendToMultNodes = (from, to, amount, nodes) => {
  const accs = nodes.map(node => new Account(node, from));
  const txes = accs.map(acc => acc.send(to, amount));
  Promise.all(txes)
    .then(values => values.map(v => utils.logTx(v)));
};

program
  .version('0.0.1')
  .usage('[options] <file ...>');

program
  .command('send <from> <to> <amount> <node>')
  .description('Send <amount> ETH to <to> from private key <from> througth the node <node>')
  .action(send);

program
  .command('sendFromMul <to> <amount> <node> [froms...] ')
  .description('Send <amount> ETH to <to> from multiple private key [froms] througth the node <node>')
  .action(sendFromMul);

program
  .command('sendToMulNodes <from> <to> <amount> [nodes...] ')
  .description('Send <amount> ETH to <to> from <from> througth the node [nodes]')
  .action(sendToMultNodes);

program.parse(process.argv);
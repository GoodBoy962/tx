const osmosis = require('osmosis');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const dateFormat = require('dateformat');

const web3 = new Web3('https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst');

/**
 * Return actual gas price for the ethereum main net
 * @returns {Promise<number>}
 */
const getGasPrice = async () => {
  let price = 5 * 10 ** 9;
  try {
    await osmosis
      .get('https://ethgasstation.info/')
      .set({'related': ['body > div > div > div.right_col > div:nth-child(3) > div:nth-child(3) > div > div.x_content > table > tbody > tr:nth-child(3) > td:nth-child(2)']})
      .data(data => price = data.related[0] * 10 ** 9 /*gwei*/);
  } catch (err) {
    console.error('Can\'t estimate gas price');
  }
  return price;
};

/**
 * Return user directory
 * @return {String}
 */
const getUserHome = () =>
  process.env[
    (process.platform === 'win32')
      ? 'USERPROFILE'
      : 'HOME'
    ];

/**
 * Prelog tx
 * @param node node uri
 * @param hash transaction hash
 * @param initTime time in milliseconds transaction was initialized on a server
 * @returns time {number}
 */
const logTxPre = (node, hash, initTime) => {
  const time = new Date(new Date().getTime() - initTime);
  console.log(node, `Tx ${hash} on a node in ${dateFormat(time, "MM:ss:l")}`);
};

/**
 * Postlog tx
 * @param node
 * @param tx
 * @param initTime
 */
const logTxPost = (node, tx, initTime) => {
  const pTime = new Date().getTime();
  console.log(node, `Tx: ${tx.transactionHash} , block: ${tx.blockNumber}`);
  const time = new Date(pTime - initTime);
  console.log(node, `Time for the ${tx.transactionHash} confirmation: ${dateFormat(time, "MM:ss:l")} seconds`);
};

/**
 * Return nonce
 * @param address
 * @returns {Promise<string>}
 */
const getNonce = async address => {
  const nonce = await web3.eth.getTransactionCount(address);
  return web3.utils.toHex(nonce);
};

/**
 * Sign tx and serialize result
 * @param tx
 * @param privateKey
 * @returns {string}
 */
const signTx = (tx, privateKey) => {
  privateKey = new Buffer(privateKey, 'hex');
  const signedTx = new Tx(tx);
  signedTx.sign(privateKey);
  return '0x' + signedTx.serialize().toString('hex');
};

const getWeb3Node = provider => new Web3(provider);

module.exports = {
  signTx,
  getGasPrice,
  getUserHome,
  getNonce,
  getWeb3Node,
  logTxPost,
  logTxPre
};

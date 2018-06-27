const osmosis = require('osmosis');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

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
  console.log('########################################################################################################################################################################################');
  const time = new Date(new Date().getTime() - initTime);
  console.log(`Sending tx ${hash} through ${node}`);
  console.log(`Tx ${hash} on a node in ${time.getMinutes()} minutes ${time.getSeconds()} seconds`);
  return time;
};

/**
 * Postlog tx
 * @param tx
 * @param initTime
 */
const logTxPost = async (tx, initTime) => {
  console.log(`Tx: ${tx.transactionHash} , block: ${tx.blockNumber}`);
  setTimeout(async () => {
    const block = await web3.eth.getBlock(tx.blockNumber);
    const time = new Date(block.timestamp * 1000 - initTime);
    console.log(`Time for the ${tx.transactionHash} confirmation: ${time.getMinutes()} minutes ${time.getSeconds()} seconds`);
    console.log('########################################################################################################################################################################################');
  }, 10000);
};

/**
 * Return nonce
 * @param address
 * @returns {Promise<string>}
 */
const getNonce =
  async address => {
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

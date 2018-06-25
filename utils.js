const osmosis = require('osmosis');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

const web3 = new Web3('https://ropsten.infura.io/oI5puXL7bMnaY7Dv9AzFconst');

/**
 * Return actual gas price for the ethereum main net
 * @returns {Promise<number>}
 */
const getGasPrice =
  async () => {
    let price = 5 * 10 ** 9;
    try {
      await osmosis
        .get('https://ethgasstation.info/')
        .set({'related': ['body > div > div > div.right_col > div.row.tile_count > div:nth-child(2) > div']})
        .data(data => price = data.related[0] * 10 ** 9 /*gwei*/);
    } catch (err) {
    }
    return price;
  };

/**
 * Return user directory
 * @return {String}
 */
const getUserHome =
  () =>
    process.env[
      (process.platform === 'win32')
        ? 'USERPROFILE'
        : 'HOME'
      ];

/**
 * Prelog tx
 */
const logTxPre
  = (node) => {
  console.log('########################################################################################################################################################################################');
  // console.log(`Time: ${new Date().getTime()}`);
  console.log(`Sending tx ... througn ${node}`);
};

/**
 * Postlog tx
 * @param tx
 */
const logTxPost =
  (tx) => {
    console.log('Block number: ', tx.blockNumber);
    console.log('Tx hash: ', tx.transactionHash);
    console.log('########################################################################################################################################################################################');
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
const signTx =
  (tx, privateKey) => {
    privateKey = new Buffer(privateKey, 'hex');
    const signedTx = new Tx(tx);
    signedTx.sign(privateKey);
    return '0x' + signedTx.serialize().toString('hex');
  };

const getWeb3Node =
  provider => new Web3(provider);

module.exports = {
  signTx,
  getGasPrice,
  getUserHome,
  getNonce,
  getWeb3Node,
  logTxPost,
  logTxPre
};

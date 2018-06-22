const osmosis = require('osmosis');

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
        .set({ 'related': ['body > div > div > div.right_col > div.row.tile_count > div:nth-child(2) > div'] })
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
      (process.platform == 'win32')
        ? 'USERPROFILE'
        : 'HOME'
      ];

const logTx =
  (tx) => {
    console.log('\n############################ Tx ##########################');
    console.log('Block number: ', tx.blockNumber);
    console.log('Tx hash: ', tx.transactionHash);
    console.log('############################ Tx ##########################\n');
  };

module.exports = {
  getGasPrice,
  getUserHome,
  logTx
};

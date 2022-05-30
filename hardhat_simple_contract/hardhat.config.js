require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
//0x5FbDB2315678afecb367f032d93F642f64180aa3
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();
module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/ba1abf23f37241e2896b48adc745f55d", //Infura url with project Id
      accounts: [mnemonic] //Add the account that will deploy the contract (Private key)
    }
  }
};

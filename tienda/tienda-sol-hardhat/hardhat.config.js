require("@nomicfoundation/hardhat-toolbox");
require("utils/hardhat-plugins/index");
require('dotenv').config()

const privateKey = process.env.P_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7546",
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    mumbai: {
      url: process.env.MUMBAI_RPC,
      accounts: [`0x${privateKey}`]
    },
        
  },
};
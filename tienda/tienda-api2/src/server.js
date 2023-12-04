var express = require('express')
require('dotenv').config()
var bodyParser= require('body-parser')
var yaml =require("yaml")
var fs= require("fs")
const cors = require("cors")
const _ =require("lodash")

var app = express();
app.use(bodyParser.json());
app.use(cors())

const { Wallets, Gateway } = require('fabric-network');

const config = {
    caName: process.env.CA_NAME,
    channelName: process.env.CHANNEL_NAME,
    chaincodeName: process.env.CHAINCODE_NAME,
    mspID: process.env.MSP_ID,
    hlfUser: process.env.HLF_USER,
    walletPath: process.env.WALLETPATH,
    networkConfigPath: process.env.NETWORK_CONFIG_PATH,
}

function checkConfig() {
    if (!config.caName) {
        throw new Error("CA_NAME is not set");
    }
    if (!config.channelName) {
        throw new Error("CHANNEL_NAME is not set");
    }
    if (!config.chaincodeName) {
        throw new Error("CHAINCODE_NAME is not set");
    }
    if (!config.mspID) {
        throw new Error("MSP_ID is not set");
    }
    if (!config.hlfUser) {
        throw new Error("HLF_USER is not set");
    }
    if (!config.networkConfigPath) {
        throw new Error("NETWORK_CONFIG_PATH is not set");
    }
}

checkConfig()

app.get('/test', async (req, res) => {
    res.send("test OK")
})

app.get('/config', async (req, res) => {
    res.send(config)
})

app.post('/id', async (req, res) => {
    try {
        const user = req.body.user
        const wallet = await Wallets.newFileSystemWallet(config.walletPath)
        const ccpFileYaml = yaml.parse(fs.readFileSync(config.networkConfigPath, {encoding: 'utf-8'}))
        const userData = _.get(ccpFileYaml, `organizations.${config.mspID}.users.${user}`)

        const cert = userData.cert.pem.toString()
        const key = userData.key.pem.toString()

        console.log("cert",cert)
        console.log("key", key)

        const identity = { // type X509Identity if typescript file
            credentials: {
                certificate: cert,
                privateKey: key
            },
            mspId: config.mspID,
            type: "X.509"
        }

        await wallet.put(user, identity)

        res.send(`user id ${user} registered`)
    } catch(error) {
        console.error(`Failed to register user: ${error}`);
        res.status(500).json({error: error});
    }
})

app.post('/consult', async (req, res) => {
    try {
        const fcn = req.body.fcn
        const user = req.body.user
        const ccpFileYaml = yaml.parse(fs.readFileSync(config.networkConfigPath, {encoding: 'utf-8'}))
        const gateway = new Gateway();
        const wallet = await Wallets.newFileSystemWallet(config.walletPath)
        await gateway.connect(ccpFileYaml, {identity: user, wallet: wallet} )

        const network = await gateway.getNetwork("tienda");

        const contract= network.getContract("tienda-dev")

        const result = await contract.evaluateTransaction(fcn, ...(req.body.args || []))
        console.log("result", result.toString())
        gateway.disconnect()
        res.send(result.toString())

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
    } 
})

app.post('/submit', async (req, res) => {
    try {
        const fcn = req.body.fcn
        const user = req.body.user
        const ccpFileYaml = yaml.parse(fs.readFileSync(config.networkConfigPath, {encoding: 'utf-8'}))
        const gateway = new Gateway();
        const wallet = await Wallets.newFileSystemWallet(config.walletPath)
        await gateway.connect(ccpFileYaml, {identity: user, wallet: wallet} )

        const network = await gateway.getNetwork("tienda");

        const contract= network.getContract("tienda-dev")

        console.log("deuxime arguement", req.body.args[1])

        const result = await contract.submitTransaction(fcn, ...(req.body.args || []) )
        console.log("transaction registered", result.toString())
        gateway.disconnect()
        res.send(result.toString())

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
    }
})

const server = app.listen(
    {
        port: process.env.PORT || 3003,
        host: process.env.HOST || "0.0.0.0",
    },
    () => {
        const addressInfo= server.address();
        console.log(`
    Server is running!
    Listening on ${addressInfo.address}:${addressInfo.port}
  `);
    }
);
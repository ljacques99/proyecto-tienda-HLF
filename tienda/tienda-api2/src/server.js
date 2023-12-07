var express = require('express')
require('dotenv').config()
var bodyParser= require('body-parser')
var yaml =require("yaml")
var fs= require("fs")
const cors = require("cors")
const _ =require("lodash")
var FabricCAservices = require('fabric-ca-client')
var {User} = require('fabric-common')

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
    if (!config.walletPath) {
        throw new Error("WALLETPATH is not set");
    }
    if (!config.networkConfigPath) {
        throw new Error("NETWORK_CONFIG_PATH is not set");
    }
}

checkConfig()

const ccpFileYaml = yaml.parse(fs.readFileSync(config.networkConfigPath, {encoding: 'utf-8'}))
        
async function init() { // We enroll an admin user with the CA and save its credentials when we launch the API
    const wallet = await Wallets.newFileSystemWallet(config.walletPath)
        

    const ca = ccpFileYaml.certificateAuthorities[config.caName]
    if (!ca) {
        throw new Error(`Certificate authority ${config.caName} not found in network configuration`);
    }
    const caURL = ca.url;
    if (!caURL) {
        throw new Error(`Certificate authority ${config.caName} does not have a URL`);
    }

    const fabricCAServices = new FabricCAservices(caURL, {
        trustedRoots: [ca.tlsCACerts.pem[0]],
        verify: true,
    }, ca.caName)

    const enrollment = await fabricCAServices.enroll({
        enrollmentID: ca.registrar.enrollId,
        enrollmentSecret: ca.registrar.enrollSecret
    });
    const x509Identity = {
    credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
        },
    mspId: config.mspID,
    type: 'X.509',
    };
    await wallet.put('ca-admin', x509Identity);
}
init()

async function connectGateway(user, gateway) {
    try {
        const wallet = await Wallets.newFileSystemWallet(config.walletPath)
        await gateway.connect(ccpFileYaml, {identity: user, wallet: wallet} )

        const network = await gateway.getNetwork("tienda")

        const contract= network.getContract("tienda-dev")

        return contract
    } catch(error) {
        throw new Error(error)
    }
}

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

app.post('/registeruser', async (req, res) => {
    const wallet = await Wallets.newFileSystemWallet(config.walletPath)
    try {
        const username = req.body.user

        const ca = ccpFileYaml.certificateAuthorities[config.caName]
            if (!ca) {
                throw new Error(`Certificate authority ${config.caName} not found in network configuration`);
            }
            const caURL = ca.url;
            if (!caURL) {
                throw new Error(`Certificate authority ${config.caName} does not have a URL`);
            }

            const fabricCAServices = new FabricCAservices(caURL, {
                trustedRoots: [ca.tlsCACerts.pem[0]],
                verify: true,
            }, ca.caName)

            // Check to see if we've already enrolled the user.
            const userExists = await wallet.get(username);
            if (userExists) {
                console.log('An identity for the user \"', username, '\" already exists in the wallet');
                return;
            }

            const adminIdentity = await wallet.get('ca-admin');

            /* const registrarUserResponse = await fabricCAServices.enroll({
                enrollmentID: ca.registrar.enrollId,
                enrollmentSecret: ca.registrar.enrollSecret
            }); */

            const registrar = User.createUser(
                ca.registrar.enrollId,
                ca.registrar.enrollSecret,
                config.mspID,
                adminIdentity.credentials.certificate,
                adminIdentity.credentials.privateKey
            );


            const secret = await fabricCAServices.register({
                enrollmentID: username,
                affiliation: "",
                role: "client",
                attrs: [],
                maxEnrollments: -1
            }, registrar)

            const enrollment = await fabricCAServices.enroll({
                enrollmentID: username,
                enrollmentSecret: secret,
            })
            
            const userIdentity = { // type X509Identity if typescript file
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes()
                },
                mspId: config.mspID,
                type: "X.509"
            }
            await wallet.put(username, userIdentity);
            console.log('Successfully registered and enrolled client user \"', username, '\" and imported it into the wallet');
            res.send(`Successfully registered and enrolled client user  ${username} and imported it into the wallet`)
        } catch(error) {
            console.error(`Failed to register user ${username}`);
            res.status(500).json({error: error});
        }
})

app.post('/consult', async (req, res) => {
    const gateway = new Gateway();
    try {
        const fcn = req.body.fcn
        const user = req.body.user

        const contract = await connectGateway(user, gateway)

        const result = await contract.evaluateTransaction(fcn, ...(req.body.args || []))
        console.log("result", result.toString())
        res.send(result.toString())

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
    } finally {
        gateway.disconnect()
    }
})


app.post('/submit', async (req, res) => {
    const gateway = new Gateway();
    try {
        const fcn = req.body.fcn
        const user = req.body.user

        const contract = await connectGateway(user, gateway)

        console.log("deuxime arguement", req.body.args[1])

        const result = await contract.submitTransaction(fcn, ...(req.body.args || []) )
        console.log("transaction registered", result.toString())
        res.send(result.toString())

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
    } finally {
        gateway.disconnect()
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
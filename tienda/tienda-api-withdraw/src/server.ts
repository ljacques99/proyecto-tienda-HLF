import "reflect-metadata";

import { connect } from '@hyperledger/fabric-gateway';
//import {fetch} from 'dom';
import fetch from "node-fetch";
import { User } from 'fabric-common';
import { promises as fs } from 'fs';
import * as _ from "lodash";
import type { AddressInfo } from "net";
import { Logger } from "tslog";
import * as yaml from "yaml";
import { checkConfig, config } from './config';
import FabricCAServices = require("fabric-ca-client")
import express = require("express")
import { newGrpcConnection, newConnectOptions } from './utils';
var cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const cors = require("cors")
const ethers = require("ethers")

const log = new Logger({ name: "tienda-api" })

const tiendaContractName= "TiendaContract"
const tokenContractName="TokenERC20Contract"

const providerURL="https://rpc-mumbai.maticvigil.com/" //address of the connection to the network where solidity smart contract is deployed
const chainId = 80001 // chain ID of network of smart contract

const contractFilePath = "../tienda-sol/contract-address.txt"
const ABIFile = "../tienda-sol/contract.abi"
const ownerFilePath = "../tienda-sol/contract-details.json" //json file with owner address and private key




async function main() {
    checkConfig()
    const networkConfig = yaml.parse(await fs.readFile(config.networkConfigPath, 'utf8'));
    const orgPeerNames = _.get(networkConfig, `organizations.${config.mspID}.peers`)
    if (!orgPeerNames) {
        throw new Error(`Organization ${config.mspID} doesn't have any peers`);
    }
    let peerUrl: string = "";
    let peerCACert: string = "";
    let idx = 0
    for (const peerName of orgPeerNames) {
        console.log(peerName)
        const peer = networkConfig.peers[peerName]
        const peerUrlKey = `url`
        const peerCACertKey = `tlsCACerts.pem`
        peerUrl = _.get(peer, peerUrlKey).replace("grpcs://", "")
        peerCACert = _.get(peer, peerCACertKey)
        idx++;
        if (idx >= 1) {
            break;
        }
    }
    if (!peerUrl || !peerCACert) {
        throw new Error(`Organization ${config.mspID} doesn't have any peers`);
    }
    const ca = networkConfig.certificateAuthorities[config.caName]
    if (!ca) {
        throw new Error(`Certificate authority ${config.caName} not found in network configuration`);
    }
    const caURL = ca.url;
    if (!caURL) {
        throw new Error(`Certificate authority ${config.caName} does not have a URL`);
    }

    const fabricCAServices = new FabricCAServices(caURL, {
        trustedRoots: [ca.tlsCACerts.pem[0]],
        verify: true,
    }, ca.caName)

    const identityService = fabricCAServices.newIdentityService()
    const registrarUserResponse = await fabricCAServices.enroll({
        enrollmentID: ca.registrar.enrollId,
        enrollmentSecret: ca.registrar.enrollSecret
    });

    const registrar = User.createUser(
        ca.registrar.enrollId,
        ca.registrar.enrollSecret,
        config.mspID,
        registrarUserResponse.certificate,
        registrarUserResponse.key.toBytes()
    );
    
    const grpcConn = await newGrpcConnection(peerUrl, Buffer.from(peerCACert))
    

    const adminUser = _.get(networkConfig, `organizations.${config.mspID}.users.${config.hlfUser}`)
    const userCertificate = _.get(adminUser, "cert.pem")
    const userKey = _.get(adminUser, "key.pem")
    if (!userCertificate || !userKey) {
        throw new Error(`User ${config.hlfUser} not found in network configuration`);
    }
    
    const connectOptions = await newConnectOptions(
        grpcConn,
        config.mspID,
        Buffer.from(userCertificate),
        userKey
    )
    const gateway = connect(connectOptions);
    const network = gateway.getNetwork(config.channelName);
    const contract = network.getContract(config.chaincodeName, tokenContractName);
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use(cookieParser())
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    const contractAddress =Buffer.from(await fs.readFile(contractFilePath)).toString()
    const ABI = JSON.parse(await fs.readFile(ABIFile, 'utf8'))

    const ownerData = await fs.readFile(ownerFilePath,'utf8') 
    const owner=JSON.parse(ownerData) 
   //const provider = new ethers.providers.WebSocketProvider("wss://rpc-mumbai.maticvigil.com/ws/v1/5a57fae47ff525cc2f117eb4a1d99f7ac3674f0d")
    const provider = new ethers.providers.JsonRpcProvider(providerURL)
    const signer = new ethers.Wallet(owner.ownerPrivateKey,provider)
    const contractETH = new ethers.Contract(contractAddress, ABI, signer)


    app.post("/withdraw", async (req, res) => {
        try { // args = user and nonce

            //gat amount to pay from chaincode
            const respuestaBuffer = await contract.evaluateTransaction("getBurnAmount", ...(req.body.args || []));
            const respuesta = JSON.parse(Buffer.from(respuestaBuffer).toString())
            console.log("respuesta", respuesta)
            const amount = Number(respuesta.amount)


            console.log("amount to withdraw", amount)

            const to = respuesta.address

            console.log("to", to)

            // send money to user
            const txUnsigned = await contractETH.populateTransaction.withdraw(amount, to)
            txUnsigned.gasLimit = await contractETH.estimateGas.withdraw(amount, to)
            txUnsigned.chainId = chainId
            txUnsigned.gasPrice = provider.getGasPrice() // put a fixed amount
            txUnsigned.nonce = await provider.getTransactionCount(owner.ownerAddress)
          

            const txSigned = await signer.signTransaction(txUnsigned)
            const tx = await provider.sendTransaction(txSigned)

            console.log("transaction sent", tx)
            
            const receipt = await tx.wait()

            console.log("transaction receipt", receipt)

            if (receipt.status === 0) {
                throw new Error("MATIC transaction failed")
                return
            }

            //write in chaincode than money was paid

            const responseBuffer = await contract.submitTransaction("registerWithdrawn", ...(req.body.args || []));
            const responseString = Buffer.from(responseBuffer).toString();

            res.send(responseString);
        } catch (e) {
            res.status(400)
            res.send(e.details && e.details.length ? e.details : e.message);
        }
    })

    app.post("/initialize", async (req, res) => {
        try {
            const responseBuffer = await contract.submitTransaction("Initialize", ...(req.body.args || []) );
            const responseString = Buffer.from(responseBuffer).toString()
            res.send(responseString)

        } catch (e) {
            res.status(400)
            res.send(e.details && e.details.length ? e.details : e.message);
        }
    })

    app.get("/tokenname", async (req, res) => {
        try {
            const responseBuffer = await contract.evaluateTransaction("TokenName");
            const responseString = Buffer.from(responseBuffer).toString()
            res.send(responseString)

        } catch (e) {
            res.status(400)
            res.send(e.details && e.details.length ? e.details : e.message);
        }
    })

    

    const server = app.listen(
        {
            port: process.env.PORT || 3003,
            host: process.env.HOST || "0.0.0.0",
        },
        () => {
            const addressInfo: AddressInfo = server.address() as AddressInfo;
            console.log(`
        Server is running!
        Listening on ${addressInfo.address}:${addressInfo.port}
      `);
        }
    );

}


main()

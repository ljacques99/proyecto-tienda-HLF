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
const cors = require("cors")

const log = new Logger({ name: "north-api" })


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


    const adminUser = _.get(networkConfig, `organizations.${config.mspID}.users.${config.hlfUser}`)
    const userCertificate = _.get(adminUser, "cert.pem")
    const userKey = _.get(adminUser, "key.pem")
    if (!userCertificate || !userKey) {
        throw new Error(`User ${config.hlfUser} not found in network configuration`);
    }
    const grpcConn = await newGrpcConnection(peerUrl, Buffer.from(peerCACert))
    const connectOptions = await newConnectOptions(
        grpcConn,
        config.mspID,
        Buffer.from(userCertificate),
        userKey
    )
    const gateway = connect(connectOptions);
    const network = gateway.getNetwork(config.channelName);
    const contract = network.getContract(config.chaincodeName);
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    async function OrderList (customerList)  { return new Promise((resolve, reject) => {
        var orderList: string[] = []
        var count: number = 0
        customerList.map( async (item) => {
            //console.log(item.customer_id)
            
            await fetch(`http://localhost:4455/ordersByCustomer`, {
                method:'POST',
                body: JSON.stringify({customer_id : item.customer_id}),
                headers : {'Content-type': 'application/json'}
            }).then(res => res.json())
            .then(async (res) => {
                res.map(async (item) => {
                    orderList.push(item.order_id.toString())
                    count = count + 1    
                    console.log("item2", item.order_id, count)
                    var arrayCust =[]
                    for (let i in item) { if (item[i]== undefined) {arrayCust.push("null")} else {arrayCust.push(item[i].toString())}}
                    //console.log(arrayCust)
                    await contract.submitTransaction("addOrder", ...(arrayCust || []))
                    //console.log("terminé", item.order_id, count) 
            })})})
        //return orderList
        console.log("liste", orderList)
        setTimeout(() => resolve(orderList),30000)
    })}

    async function OrderDetails (orderList)  { return new Promise((resolve, reject) => {
        var count: number = 0
        orderList.map( async (item) => {
            //console.log(item.customer_id)
            
            await fetch(`http://localhost:4455/orderdetailsByOrder`, {
                method:'POST',
                body: JSON.stringify({order_id : item}),
                headers : {'Content-type': 'application/json'}
            }).then(res => res.json())
            .then(async (res) => {
                res.map(async (item) => {
                    count = count + 1    
                    console.log("item3", item.order_id, item.product_id, count)
                    var arrayCust =[]
                    for (let i in item) { if (item[i]== undefined) {arrayCust.push("null")} else {arrayCust.push(item[i].toString())}}
                    //console.log(arrayCust)
                    await contract.submitTransaction("addOrderDetail", ...(arrayCust || []))
                    //console.log("terminé", item.order_id, count) 
            })})})
        //return orderList
        //console.log("liste", orderList)
        //setTimeout(() => resolve(orderList),30000)
    })}

    app.get("/init", async (req, res) => {
        try {
            const customerList = await fetch(`http://localhost:4455/customers`).then(res => res.json())
            //console.log(customerList)
            
            await customerList.map( async (item) => {
                var arrayCust =[]
                for (let i in item) { if (item[i]== undefined) {arrayCust.push("null")} else {arrayCust.push(item[i])}}
                console.log(arrayCust)
                await contract.submitTransaction("addCustomer", ...(arrayCust || []))                
             })
            // .then(async item =>  await contract.submitTransaction("addCustomer", item))
            
            await OrderList(customerList).then(orderList => {console.log("dans init",orderList); OrderDetails(orderList)}).then(() =>log.info("Initialised")).then(() =>res.send("initialisé") )
            
            
        } catch (e) {
            res.send(e.details && e.details.length ? e.details : e.message);
        }
    })
    const users = {}
    app.post("/signup", async (req, res) => {
        const { username, password } = req.body
        let identityFound = null
        try {
            identityFound = await identityService.getOne(username, registrar)
        } catch (e) {
            log.info("Identity not found, registering", e)
        }
        if (identityFound) {
            res.status(400)
            res.send("Username already taken")
            return
        }
        await fabricCAServices.register({
            enrollmentID: username,
            enrollmentSecret: password,
            affiliation: "",
            role: "client",
            attrs: [],
            maxEnrollments: -1
        }, registrar)
        res.send("OK")
    })
    app.post("/login", async (req, res) => {
        const { username, password } = req.body
        let identityFound = null
        try {
            identityFound = await identityService.getOne(username, registrar)
        } catch (e) {
            log.info("Identity not found, registering", e)
            res.status(400)
            res.send("Username not found")
            return
        }
        const r = await fabricCAServices.enroll({
            enrollmentID: username,
            enrollmentSecret: password,
        })
        users[username] = r
        res.send("OK")
    })
    app.use(async (req, res, next) => {
        (req as any).contract = contract
        try {
            const user = req.headers["x-user"] as string
            console.log(users, user)
            if (user && users[user]) {
                const connectOptions = await newConnectOptions(
                    grpcConn,
                    config.mspID,
                    Buffer.from(users[user].certificate),
                    users[user].key.toBytes()
                )
                const gateway = connect(connectOptions);
                const network = gateway.getNetwork(config.channelName);
                const contract = network.getContract(config.chaincodeName);
                (req as any).contract = contract
            }
            next()
        } catch (e) {
            log.error(e)
            next(e)
        }
    })
    app.get("/ping", async (req, res) => {
        try {
            const responseBuffer = await (req as any).contract.evaluateTransaction("Ping");
            const responseString = Buffer.from(responseBuffer).toString();
            res.send(responseString);
        } catch (e) {
            res.status(400)
            res.send(e.details && e.details.length ? e.details : e.message);
        }
    })
    app.get("/id", async (req, res) => {
        try {
            const responseBuffer = await (req as any).contract.evaluateTransaction("getMyIdentity");
            const responseString = Buffer.from(responseBuffer).toString();
            res.send(responseString);
        } catch (e) {
            res.status(400)
            res.send(e.details && e.details.length ? e.details : e.message);
        }
    })
    /* app.post("/addCustomer", async (req, res) => {
        try {
            const fcn = req.body.fcn
            const responseBuffer = await (req as any).contract.evaluateTransaction(fcn, ...(req.body.args || []));
            const responseString = Buffer.from(responseBuffer).toString();
            res.send(responseString);
        } catch (e) {
            res.status(400)
            res.send(e.details && e.details.length ? e.details : e.message);
        }
    }) */

    app.post("/consult", async (req, res) => {
        try {
            const fcn = req.body.fcn
            const responseBuffer = await (req as any).contract.evaluateTransaction(fcn, ...(req.body.args || []));
            const responseString = Buffer.from(responseBuffer).toString();
            res.send(responseString);
        } catch (e) {
            res.status(400)
            res.send(e.details && e.details.length ? e.details : e.message);
        }
    })

    app.post("/submit", async (req, res) => {
        try {
            const fcn = req.body.fcn
            const responseBuffer = await (req as any).contract.submitTransaction(fcn, ...(req.body.args || []));
            const responseString = Buffer.from(responseBuffer).toString();
            res.send(responseString);
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

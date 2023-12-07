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

const log = new Logger({ name: "tienda-api" })


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
    let contract=null // to quit when untoggle comment

    /* const adminUser = _.get(networkConfig, `organizations.${config.mspID}.users.${config.hlfUser}`)
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
    const contract = network.getContract(config.chaincodeName); */
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

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
        try {
            const r = await fabricCAServices.enroll({
                enrollmentID: username,
                enrollmentSecret: password,
            })
            users[username] = r
            res.send("OK")
        } catch(e) {
            res.status(400)
            res.send(e.details && e.details.length ? e.details : e.message);
        }
    })
    app.use( /^(\/.+|(?!\/signup|\/login|\/disconnect).*)$/, async (req, res, next) => {
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
            } else {
                throw new Error(`El usuario ${user} no existe`)
            } 
            next()
        } catch (e) {
            log.error(e)
            res.status(400)
            res.send(e.details && e.details.length ? e.details : e.message);
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

    app.get("/disconnect", async (req, res) => {
        const user = req.headers["x-user"] as string
        console.log(users, user)
        if (user && users[user]) {
            users[user]=null
            res.send("disconnected")
        } else {
            res.status(400).send(`No user ${user} to disconnect`)
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

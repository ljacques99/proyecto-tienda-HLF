//var yaml = require("js-yaml")
var yaml =require("yaml")
var fs = require("fs")
var FabricCAservices = require('fabric-ca-client')
const _ =require("lodash")
var {User} = require('fabric-common')


const { Wallets, Gateway, X509Identity,  X509WalletMixin} = require('fabric-network');
const { log } = require("console");


async function test () {
    const wallet = await Wallets.newFileSystemWallet('./WALLETS/wallet')

    const fcn = "getMyInvoiceClient"
    //const fcn = "getMyIdentity"
    const gateway = new Gateway();

    const user= "user-org2"

    const ccpFileYaml = yaml.load(fs.readFileSync("../../tienda2.yaml", {encoding: 'utf-8'}))
    //console.log(ccpFileYaml)
    //console.log(JSON.stringify(ccpFileYaml))
    //const ccpFile = JSON.parse(JSON.stringify(ccpFileYaml))

    //console.log(ccpFile.organizations.Org2MSP.users.userorg2)

    /* const cert = ccpFileYaml.organizations.Org2MSP.users.userorg2.cert.pem.toString()
    const key = ccpFileYaml.organizations.Org2MSP.users.userorg2.key.pem.toString()

    console.log("cert",cert)
    console.log("key", key)

    const identity = { // type X509Identity if typescript file
        credentials: {
            certificate: cert,
            privateKey: key
        },
        mspId: 'Org2MSP',
        type: "X.509"
    } */

    //await wallet.put("userorg2", identity)

    await gateway.connect(ccpFileYaml, {identity: user, wallet: wallet} )

    const network = await gateway.getNetwork("tienda");

    const contract= network.getContract("tienda-dev")

    const result = await contract.evaluateTransaction(fcn)
    console.log("result", result.toString())

    const args = ['x509::/OU=client/CN=clientorg1::/C=ES/L=Alicante/=Alicante/O=Kung Fu Software/OU=Tech/CN=ca', '[{"productId": "prod1", "quantity": "2"},{"productId": "prod2", "quantity": "4"}]']
    const result2 = await contract.submitTransaction("addInvoice", ...(args || []) )
    console.log("result2", result2.toString())

    await gateway.disconnect()
}

//test()



async function registerUser(adminName, username) {
    try {
        // Create a new file system based wallet for managing identities.
        const networkConfigPath = "../../tienda2.yaml"
        const mspID = "Org1MSP"
        const caName="org1-ca.tienda"
        const walletPath = "./WALLETS/wallet1"
        const wallet = await Wallets.newFileSystemWallet(walletPath)
        const networkConfig= yaml.parse(fs.readFileSync(networkConfigPath, {encoding: 'utf-8'}))

        const ca = networkConfig.certificateAuthorities[caName]
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

        

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get(adminName);
        if (!adminIdentity) {
            console.log('An identity for the admin user \"', adminName, '\" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        console.log("adminID", adminIdentity)



        const registrarUserResponse = await fabricCAServices.enroll({
            enrollmentID: ca.registrar.enrollId,
            enrollmentSecret: ca.registrar.enrollSecret
        });

        console.log('registrar',  registrarUserResponse.certificate)
        console.log('adminIDnetity', adminIdentity.credentials.certificate )

        console.log('registrar',  registrarUserResponse.key.toBytes())
        console.log('adminIDnetity', adminIdentity.credentials.privateKey )

        const registrar = User.createUser(
            ca.registrar.enrollId,
            ca.registrar.enrollSecret,
            mspID,
            registrarUserResponse.certificate,
            registrarUserResponse.key.toBytes()
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
            mspId: mspID,
            type: "X.509"
        }
        await wallet.put(username, userIdentity);
        console.log('Successfully registered and enrolled admin user \"', username, '\" and imported it into the wallet');
        return userIdentity;
    } catch (error) {
        console.error(`Failed to register user \"`, username, `\": ${error}`);
        return error;
    }
}

registerUser("admin", "test4-org1")

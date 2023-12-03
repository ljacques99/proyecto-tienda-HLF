var yaml = require("js-yaml")
var fs = require("fs")


const { Wallets, Gateway, X509Identity } = require('fabric-network');


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

test()

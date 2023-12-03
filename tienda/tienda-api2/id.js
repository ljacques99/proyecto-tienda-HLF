//var yaml = require("js-yaml")
var yaml = require("yaml")
var fs = require("fs")
const _ =require("lodash")


const { Wallets, Gateway, X509Identity } = require('fabric-network');

async function id() {
    const wallet = await Wallets.newFileSystemWallet('./WALLETS/wallet')

    const user = "userAorg2"

    //const ccpFileYaml = yaml.load(fs.readFileSync("../../tienda2.yaml", {encoding: 'utf-8'}))
    const ccpFileYaml = yaml.parse(fs.readFileSync("../../tienda2.yaml", {encoding: 'utf-8'}))

    const userData = _.get(ccpFileYaml, `organizations.Org2MSP.users.${user}`)

    const cert = userData.cert.pem.toString()
    const key = userData.key.pem.toString()

    console.log("cert",cert)
    console.log("key", key)

    const identity = { // type X509Identity if typescript file
        credentials: {
            certificate: cert,
            privateKey: key
        },
        mspId: 'Org2MSP',
        type: "X.509"
    }

    await wallet.put(user, identity)
}

id()
//fetch('http://localhost:3003/ping').then(res => res.text()).then(res => console.log(res))

/* const lines = JSON.parse('[{"ProductId": "prod1", "quantity": "2"},{"ProductId": "prod2", "quantity": "3"}]')
//const lines = JSON.parse("[{'ProductId': 'prod1', 'quantity': '2'},{'ProductId': 'prod2', 'quantity': '3'}]")
console.log(lines)
const A = JSON.stringify(lines)
console.log(A)
console.log(JSON.parse(A)) */

const fs = require('fs')
const ethers = require('ethers')

const contractAddress = fs.readFileSync("../tienda-sol/contract-address.txt").toString()
console.log("contract",contractAddress)
const providerURL="https://rpc-mumbai.maticvigil.com/"


const ABI = JSON.parse(fs.readFileSync("../tienda-sol/contract.abi").toString())

console.log(ABI)

async function connect() {

    const provider = new ethers.providers.JsonRpcProvider(providerURL)

    const contract = new ethers.Contract(contractAddress, ABI, provider)

    let test = await contract.getBalance().then(res => parseInt(res,10)).then(res => ethers.utils.formatEther(res))

    console.log(test)

    let tx = await contract.getTx("0x40851aB11dB65A1B6fa545AAF541F2B016102a38", 2).then(res => parseInt(res,10))//.then(res => ethers.utils.formatEther(res))
    console.log(tx)
    return
}

connect()
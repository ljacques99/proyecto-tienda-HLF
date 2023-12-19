const { getNonce, totalBalance, withdraw, deposit } = require("./BridgeFunctions")
const { ethers } = require('ethers')

require('dotenv').config()

const privateKey = process.env.P_KEY
const owner = {
    publicKey: "0xf6336be0205D2F03976878cc1c80E60C66C86C50",
    privateKey: `0x${privateKey}`
}

const user = {
    publicKey: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
    privateKey: "0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0"
}

// const provider = new ethers.AlchemyProvider("matic-mumbai", "O7k01nmhg91MPukd_ooXX1gZI8iV-TcE");
const provider = new ethers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com/");
// const infuraParams = {
//     projectId: "80b69591c63a4b83b698d5ba224862e6",
//     projectSecret: "R1eARTVf5wE9P7jKcTLO55kJTEhNzgSqC6X/A40W09O979F555fBBQ"
// }
// const provider = new ethers.InfuraProvider("matic-mumbai", infuraParams.projectId, infuraParams.projectSecret );

// const signerOwner = new ethers.Wallet(owner.privateKey, provider)
const signerUser = new ethers.Wallet(user.privateKey, provider)

// getNonce(user.publicKey, signerUser)
// .then(nonce => console.log('Nonce:', nonce))
// .catch(error => console.error('Error:', error));

const nonce = 1;

// deposit(nonce, "1250", {}, signerUser)
//     .then(transactionReceipt => console.log("Transacción completada:", transactionReceipt))
//     .catch(error => console.error("Error en la transacción:", error));

totalBalance(signerUser)
.then(transactionReceipt => console.log("Transacción completada:", ethers.formatEther(transactionReceipt)))
.catch(error => console.error("Error en la transacción:", error));

// const amount = ethers.parseEther("20")
// console.log(amount)
// const to = user.publicKey

// withdraw("0.31", to, {}, signerOwner)
// .then(transactionReceipt => console.log("Transacción completada:", transactionReceipt))
// .catch(error => console.error("Error en la transacción:", error));

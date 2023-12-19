const { ethers } = require('ethers');

const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "newCommission",
        "type": "uint32"
      }
    ],
    "name": "changeCommission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "commission",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFees",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "getNonce",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "txNumber",
        "type": "uint256"
      }
    ],
    "name": "getTx",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "payFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

const contractAddress = '0x947FAD88550EdEA348dB762B41eB11EcD3224067';
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const owner = {
  publicKey: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
}
      
const user = {
  publicKey: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
};

const signerProvider = provider.getSigner();
const signerOwner = new ethers.Wallet(owner.privateKey, provider);
const signerUser = new ethers.Wallet(user.privateKey, provider);
const contract = new ethers.Contract(contractAddress, abi, signerOwner);


// Para transacciones que requieren personalización adicional con overrides
const sendTx = async (contract, methodName, args, overrides) => {
    // Verifica si se proporcionan overrides y ajusta la transacción
    const txUnsigned = await contract[methodName].populateTransaction(...args, { ...overrides });
    return await contract[methodName](...args, { ...overrides})
};

async function changeCommission(newCommission, overrides, signer) {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await sendTx(contract, 'changeCommission', [newCommission], overrides);
}

async function commission(signer) {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await contract.commission();
}

async function deposit(nonce, amount, overrides, signer) {
    amount = ethers.parseEther(amount.toString());
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await sendTx(contract, 'deposit', [nonce], { amount, ...overrides });
}

async function getBalance(signer) {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await contract.getBalance();
}

async function getFees(signer) {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await contract.getFees();
}

async function getNonce(sender, signer) {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await contract.getNonce(sender);
}

async function getTx(sender, txNumber, signer) {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await contract.getTx(sender, txNumber);
}

async function payFees(overrides, signer) {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await sendTx(contract, 'payFees', [], overrides);
}

async function totalBalance(signer) {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await contract.totalBalance();
}

async function withdraw(amount, to, overrides, signer) {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await sendTx(contract, 'withdraw', [amount, to], overrides);
}



module.exports = {
  sendTx,
  changeCommission,
  commission,
  deposit,
  getBalance,
  getFees,
  getNonce,
  getTx,
  payFees,
  totalBalance,
  withdraw,
};
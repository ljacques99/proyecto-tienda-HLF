import { ethers } from 'ethers';

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
  ]

const rpcProvider = 'https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78'
const contractAddress = '0x71c6B45B8bCe03C3aafEB99C87249B8B60DE9ab0';
const provider = new ethers.providers.JsonRpcProvider(rpcProvider);
// const owner = {
//   publicKey: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
//   privateKey: "0x31bf23cc06a4cfe564fa60e27574aad375eac60bb21229a4c904aae0322d2115"
// }


// const signerOwner = new ethers.Wallet(owner.privateKey, provider);
// const contract = new ethers.Contract(contractAddress, abi, signer);
// Para transacciones que requieren personalización adicional con overrides

export async function deposit(nonce, amount, signer) {
  const contract = new ethers.Contract(contractAddress, abi, signer);

  // Codificar los datos de la función deposit
  const encodedFunction = contract.interface.encodeFunctionData('deposit', [nonce]);
  const valueTx = ethers.utils.parseEther(amount.toString())
  // Enviar la transacción codificada
  const tx = {
      to: contractAddress,
      data: encodedFunction,
      value: valueTx, // Enviar el valor en ether si es necesario
  };

  // Enviar la transacción y esperar a que se complete
  const result = await signer.sendTransaction(tx);
  const receipt = await result.wait()
  return receipt
}


export async function getFees(signer) {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await contract.getFees();
}

export async function getNonce(sender, signer) {
  const contract = new ethers.Contract(contractAddress, abi, signer);
  
  const encodedFunction = contract.interface.encodeFunctionData('getNonce', [sender])
  const tx = {
    to: contractAddress,
    data: encodedFunction, // Enviar el valor en ether si es necesario
  };
  console.log('sender', sender)
  console.log("tx nonce", tx)

  //const result = await contract.getNonce(sender.toString())
  //console.log("result", result)

// Enviar la transacción y esperar a que se complete
   const response = await signer.call(tx);
   console.log("response", response)
   //const response = result
   return response
}


export async function totalBalance(signer) {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await contract.totalBalance();
}
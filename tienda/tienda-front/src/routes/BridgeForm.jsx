import { useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { ethers } from "ethers"
import refreshIcon from '../assets/icons/refresh-icon.svg'; 
import swapIcon from '../assets/icons/swap-icon.svg';
import ltkIcon from '../assets/icons/ltk-icon.svg';
import maticIcon from '../assets/icons/matic-icon.svg';
import bridgeFooter from '../assets/images/bridgefooter.png'
import detectEthereumProvider from '@metamask/detect-provider'

import { formatPrice, priceFormat } from '../utils/functions/formatPrice';
import { depositToHLF } from '../utils/Bridge/deposit';
import { withdrawFromHLF } from '../utils/Bridge/withdraw';
import { ClientAccountBalance } from '../utils/hlfApi/token/ClientAccountBalance';

const BridgeForm = ({ isLTKtoMATIC }) => {
  const { authState, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false)
  const [amountSend, setAmountSend] = useState('');
  const [amountReceive, setAmountReceive] = useState('');
  const [addressConnected, setAddressConnected] = useState('')

  const [maticBalance, setMaticBalance] = useState('00,00'); // Sustituir con el saldo real
  const [ltkBalance, setLtkBalance] = useState('00,00'); 

  const [error, setError] = useState('');

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setMaticBalance('0,0')
        setLtkBalance('0,0')

      }
    };

    const handleChainChanged = () => {
      setIsConnected(false);
      setMaticBalance('0,0')
      setLtkBalance('0,0')
    };

    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true })

      if (provider) {
        const accounts = await window.ethereum.request(
          { method: 'eth_accounts' }
        )
        window.ethereum.on('accountsChanged', handleAccountsChanged)
        window.ethereum.on("chainChanged", handleChainChanged)
      }
    }

    getProvider()

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const handleConnectWallet = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      setError("MetaMask is not installed.");
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      // La cuenta conectada
      const signer = await provider.getSigner();
      const balance = await provider.getBalance(accounts[0]);
      

      setAddressConnected(accounts[0])
      
      let amountLTK
      try {
        amountLTK = await ClientAccountBalance(token)
      } catch (err){
        console.loeg(err)
      }
      const LTKamount = !amountLTK ? 0 : formatPrice(amountLTK)
      setLtkBalance(LTKamount)
      console.log(LTKamount)

      const balanceInEth = priceFormat(ethers.utils.formatEther(balance));
      setIsConnected(true); // Establecer el estado a conectado
      setMaticBalance(balanceInEth);
      console.log(balanceInEth.toLocaleString('es-ES', { minimumFractionDigits: 2 }))
    } catch (error) {
      console.error("Error connecting to Metamask:", error);
      setError(error.message);
    }
  };

  const handleSwapDirection = () => {
    navigate(isLTKtoMATIC ? '/store/MATIC-LTK' : '/store/LTK-MATIC');
  };

  const handleRefresh = () => {
    // Lógica para actualizar la información
    console.log("Refreshing data...");
  };

  const handleAmountInputChange = (e, setAmountFunction) => {
    const { value } = e.target;
    let numValue = value.replace(/,/g, '.').replace(/[^\d.]/g, ''); // Reemplaza comas con puntos y elimina caracteres no numéricos
  
    if (isNaN(numValue)) {
      setAmountFunction(''); // Borra el valor si no es un número
    } else {
      setAmountFunction(formatCurrency(numValue)); // Formatea y establece el valor
    }
  };
  
  const formatCurrency = (value) => {
    let formattedValue = parseFloat(value).toFixed(2); // Limita a dos decimales
    return formattedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",").replace('.', ','); // Añade comas para miles y cambia punto por coma para decimales
  };

  useEffect(() => {
    let receiveValue = 0;
    if (!isLTKtoMATIC) {
      receiveValue = parseFloat(amountSend) * 1000; // 1 MATIC = 1000 LTK
    } else {
      receiveValue = parseFloat(amountSend) / 1000; // 1000 LTK = 1 MATIC
    }
    setAmountReceive(isNaN(receiveValue) ? '' : receiveValue.toString());
  }, [amountSend, isLTKtoMATIC]);

  const handleSwap = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      setError("MetaMask is not installed.");
      return;
    }
    if (isLTKtoMATIC) {
      const newAmount = amountSend * 100
      // Lógica para withdrawFromHLF
      await withdrawFromHLF(newAmount.toString(), token)
      //console.log('Withdrawal from HLF executed successfully.');
    } else {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signerUser = await provider.getSigner()
      const accounts = await provider.send("eth_requestAccounts", []);

      await depositToHLF(accounts[0], token, `${amountSend}`, signerUser);
      //console.log('Deposit to HLF executed successfully.');
    }
  }


  return (
    <div className="bg-brandTwo h-screen flex flex-col items-center pt-20 ">
      
      <div className="w-full max-w-sm mb-4">
        {/* Contenedores de saldos */}
        <div className="flex justify-start items-center">
          <button onClick={handleRefresh} className="focus:animate-spin bg-brandTwo rounded-full p-2 mr-2">
            <img src={refreshIcon} alt="Refresh" className="h-10 w-11" />
          </button>
          {/* Contenedor de saldo MATIC */}
          <div className="flex-grow w-2/4">
            <div className="bg-brandOne text-brandTwo rounded-lg p-2 flex flex-col justify-between h-full border-[3px] border-white">
              <span className="text-lg font-custom mb-2">MATIC</span>
              <div className="flex justify-end bg-white rounded-lg p-2">
                <span className="text-lg font-medium">{maticBalance}</span>
              </div>
            </div>
          </div>
          {/* Espaciador entre los saldos */}
          <div className="w-4"></div>
          {/* Contenedor de saldo LTK */}
          <div className="flex-grow w-2/4">
            <div className="bg-brandOne text-brandTwo rounded-lg p-2 flex flex-col justify-between h-full border-[3px] border-white">
              <span className="text-lg font-custom mb-2">LTK</span>
              <div className="flex justify-end bg-white rounded-lg p-2">
                <span className="text-lg font-medium">{ltkBalance}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brandOne p-6 rounded-lg shadow-lg max-w-sm w-full relative border-[3px] border-white">
        <div className="mb-4">
          <label htmlFor="send" className="block text-sm font-custom mb-1">YOU SEND</label>
          <div className="flex items-center px-3 bg-white rounded-lg">
            <img src={isLTKtoMATIC ? ltkIcon : maticIcon} alt="Currency" className="h-6 w-6 mr-2" />
            <input
              type="text"
              id="send"
              value={amountSend}
              onChange={(e) => setAmountSend(e.target.value)}
              className="w-full p-2 bg-transparent outline-none text-right"
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Botón de Swap en medio del formulario */}
        <div className="flex justify-center items-center my-0 relative"> {/* my-4 para margen vertical */}

          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 w-1/2 h-0.5 bg-white"></div>

          <button onClick={handleSwapDirection} className="rounded-full focus:ring-2 focus:ring-white cursor-pointer transform active:scale-75 transition-transform z-10">
            <img src={swapIcon} alt="Swap" className="h-8 w-8" />
          </button>

          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 w-1/2 h-0.5 bg-white"></div>
        </div>

  
        <div className="mb-4">
          <label htmlFor="receive" className="block text-sm font-custom mb-1">TO RECEIVE</label>
          <div className="flex items-center px-3 bg-white rounded-lg">
            <img src={isLTKtoMATIC ? maticIcon : ltkIcon} alt="Currency" className="h-6 w-6 mr-2" />
            <input
              type="text"
              id="receive"
              value={amountReceive}
              onChange={(e) => setAmountReceive(e.target.value)}
              className="w-full p-2 bg-transparent outline-none text-right"
              placeholder="0,00"
              disabled
            />
          </div>
        </div>
  
        {isConnected ? (
        <button
          onClick={handleSwap}
          className="w-full bg-brandTwo text-white font-custom rounded-lg text-sm px-5 py-2.5 text-center hover:bg-[#B2AFA5] focus:outline-none">
          SWAP
        </button> 
        ) : (
        <button
          onClick={handleConnectWallet}
          className="w-full bg-brandTwo text-white font-custom rounded-lg text-sm px-5 py-2.5 text-center hover:bg-[#B2AFA5] focus:outline-none">
          CONNECT WALLET
        </button>
        )}
      </div>
      <div className="w-full max-w-sm mt-4 py-6">
    <img src={bridgeFooter} alt="Descripción de la imagen" className="w-full h-auto rounded-lg" />
  </div>
    </div>
  );

};

export default BridgeForm;
import { useContext, useState } from 'react';
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import refreshIcon from '../assets/icons/refresh-icon.svg'; 
import swapIcon from '../assets/icons/swap-icon.svg';
import ltkIcon from '../assets/icons/ltk-icon.svg';
import maticIcon from '../assets/icons/matic-icon.svg';
import bridgeFooter from '../assets/images/bridgeFooter.png'

import { formatPrice } from '../utils/functions/formatPrice';

const BridgeForm = ({ isLTKtoMATIC }) => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [amountSend, setAmountSend] = useState('');
  const [amountReceive, setAmountReceive] = useState('');

  const [maticBalance, setMaticBalance] = useState('23,04'); // Sustituir con el saldo real
  const [ltkBalance, setLtkBalance] = useState('1,23'); 

  const [error, setError] = useState('');

  const handleConnectWallet = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      setError("MetaMask is not installed.");
      return;
    }
    try {
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts[0]){
        const balance = await accounts[0].request({ method: 'eth_getBalance' })
        console.log(balance)
      }
    } catch (error) {
      console.error("Error connecting to Metamask:", error);
    }
  };

  const handleSwapDirection = () => {
    navigate(isLTKtoMATIC ? '/store/MATIC-LTK' : '/store/LTK-MATIC');
  };

  const handleRefresh = () => {
    // Lógica para actualizar la información
    console.log("Refreshing data...");
  };

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
  
        <button
          onClick={handleConnectWallet}
          className="w-full bg-brandTwo text-white font-custom rounded-lg text-sm px-5 py-2.5 text-center hover:bg-[#B2AFA5] focus:outline-none"
        >
          CONNECT WALLET
        </button>
      </div>
      <div className="w-full max-w-sm mt-4 py-6">
    <img src={bridgeFooter} alt="Descripción de la imagen" className="w-full h-auto rounded-lg" />
  </div>
    </div>
  );

};

export default BridgeForm;

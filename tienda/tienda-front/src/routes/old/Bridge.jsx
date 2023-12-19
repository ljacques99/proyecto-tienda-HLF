import { useContext, useState } from 'react';
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const BridgeForm = ({ isLTKtoMATIC }) => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [amountSend, setAmountSend] = useState('');
  const [amountReceive, setAmountReceive] = useState('');

  const handleConnectWallet = () => {
    // Aquí iría la lógica para conectar la wallet
    console.log("Connecting wallet...");
  };

  const handleSwapDirection = () => {
    navigate(isLTKtoMATIC ? '/store/MATIC-LTK' : '/store/LTK-MATIC');
  };

  return (
    <div className="bg-brandTwo min-h-screen w-full">
      <div className="bg-brandOne p-6 rounded-lg shadow-lg max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          {/* Icono de retorno o back */}
          <button onClick={handleSwapDirection}>
            {/* Aquí insertarías el icono correspondiente */}
          </button>

          <h1 className="text-lg font-bold text-center">{isLTKtoMATIC ? 'LTK to MATIC' : 'MATIC to LTK'}</h1>

          {/* Icono de navegación */}
          <button onClick={() => navigate(-1)}>
            {/* Aquí insertarías el icono correspondiente */}
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="send">You Send</label>
          <div className="flex items-center px-3 bg-white rounded-lg">
            {/* Aquí agregar el icono de la moneda */}
            <input
              type="number"
              id="send"
              value={amountSend}
              onChange={(e) => setAmountSend(e.target.value)}
              className="w-full p-2 bg-transparent outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="receive">To Receive</label>
          <div className="flex items-center px-3 bg-white rounded-lg">
            {/* Aquí agregar el icono de la moneda */}
            <input
              type="number"
              id="receive"
              value={amountReceive}
              onChange={(e) => setAmountReceive(e.target.value)}
              className="w-full p-2 bg-transparent outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <button
          onClick={handleConnectWallet}
          className="w-full text-brandTwo bg-black hover:bg-gray-900 focus:ring1 focus:outline-none focus:ring-white font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          <a className="text-brandTwo">CONNECT WALLET</a>
        </button>
      </div>
    </div>
  );
};

export default BridgeForm
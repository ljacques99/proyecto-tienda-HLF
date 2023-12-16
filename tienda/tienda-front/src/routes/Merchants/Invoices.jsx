import AuthContext from "../../context/AuthContext";
import { useContext } from 'react';

const Invoices = () => {
  const { authState } = useContext(AuthContext)

  return (
    <div>
      <h1>Bienvenido Invoices</h1>
      <p>Este es tu panel de control.</p>
    </div>
  );
};

export default Invoices;
import { ethers } from "ethers";
import { signUp, verifyAddressAuthority } from "../utils/hlfApi/signUp";

export const useAuth = async () => {
  const { ethereum } = window;
  if (!ethereum) {
    throw new Error('Metamask is not installed')
  }

  // Conectar con Metamask
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  // Obtener dirección pública
  const address = await signer.getAddress();

  // Crear payload del JWT
  const payload = {
    address,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 horas de validez
  };

  // Firmar el mensaje
  const signature = await signer.signMessage(JSON.stringify(payload));

  // Retornar el token
  return `Bearer ${btoa(JSON.stringify(payload))}.${signature}`;
};
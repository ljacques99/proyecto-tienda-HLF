import { jwtDecode } from 'jwt-decode';
import base64url from 'base64url';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Función para crear un header JWT
const createJWTHeader = () => {
  return base64url.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256K' }));
};

// Función para codificar el payload
const encodePayload = (payload) => {
  return base64url.encode(JSON.stringify(payload));
};

// Función para firmar el mensaje (esto es solo un placeholder)
const signMessage = async (walletAddress, params) => {
  const { ethereum } = window;

  if (!ethereum) {
    throw new Error('Metamask is not installed')
  }

  try {
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [params, walletAddress],
    });
    return { signature }
  } catch (error) {
    console.log(error)
    return null
  }
};

export const createJWT = async (walletAddress, params) => {
  const header = createJWTHeader();
  //const payload = encodePayload({ params, exp: Math.floor(Date.now() / 1000) + (60 * 60) });
  const payload = encodePayload(params);
  const msg = `${header}.${payload}`;
  const { signature } = await signMessage(walletAddress, msg)

  return `${msg}.${signature}`;
};


export const decodeJWT = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};
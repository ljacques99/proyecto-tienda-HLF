import { jwtDecode } from 'jwt-decode';
import base64url from 'base64url';

// Función para crear un header JWT
const createJWTHeader = () => {
  return base64url.encode(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
};

// Función para codificar el payload
const encodePayload = (payload) => {
  return base64url.encode(JSON.stringify(payload));
};

// Función para firmar el mensaje (esto es solo un placeholder)
const signMessage = async (msgBytes) => {
  // Aquí deberías implementar tu lógica de firma
  // Por ejemplo, una llamada a una API que firme el mensaje
  // En este ejemplo, solo devolvemos un string fijo como firma
  return 'signature';
};

export const createJWT = async (username) => {
  const header = createJWTHeader();
  const payload = encodePayload({ username, exp: Math.floor(Date.now() / 1000) + (60 * 60) });
  const msg = `${header}.${payload}`;
  const msgBytes = Buffer.from(msg, 'utf-8');
  const signatureBytes = Buffer.from(await signMessage(msgBytes));
  const signature = base64url.encode(signatureBytes);

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
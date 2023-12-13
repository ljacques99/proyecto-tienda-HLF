import { Wallets, Wallet, Identity, X509Identity } from 'fabric-network';

export async function initializeCouchDBWallet(): Promise<Wallet> {
     // Configuración para conectarse a CouchDB
     const couchDBConfig = {
        url: 'http://admin:password@localhost:5984', // Asegúrate de usar las credenciales correctas
        requestDefaults: { jar: true } // Habilita cookies para autenticación
    };
    const dbName = 'wallets-hlf'; 

    return await Wallets.newCouchDBWallet(couchDBConfig, dbName);
}

export interface UserIdentity {
    credentials: {
        certificate: string;
        privateKey: string;
    };
    mspId: string;
    type: string;
}

// export async function getUserWallet(wallet: Wallet, username: string): Promise<X509Identity | undefined> {
//     // Intenta obtener la identidad del usuario de la cartera
//     const identity = await wallet.get(username) as X509Identity;
//     return identity;
// }

export async function getUserWallet(wallet: Wallet, username: string): Promise<X509Identity | undefined> {
    const identity = await wallet.get(username) as X509Identity;
    if (identity) {
        return {
            credentials: {
                certificate: identity.credentials.certificate,
                privateKey: identity.credentials.privateKey,
            },
            mspId: identity.mspId,
            type: identity.type,
        };
    }
    return undefined;
}
import { Wallets, Wallet, Identity, X509Identity } from 'fabric-network';

export async function initializeCouchDBWallet(): Promise<Wallet> {
    const couchDBUrl = process.env.COUCHDB_URL || 'http://admin:password@localhost:5984';
    const dbName = process.env.COUCHDB_NAME;

    if (!dbName || !couchDBUrl) {
        throw new Error("You need to configure the couchDB for the user wallets!")
    }

    const couchDBConfig = {
        url: couchDBUrl,
        requestDefaults: { jar: true } // Auth cookies enabled with this
    };

    console.log(`
        CouchDB connected!
        - URL: ${couchDBUrl}
        - Database name: ${dbName}
    `)
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
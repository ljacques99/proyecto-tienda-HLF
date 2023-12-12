import HyperledgerService from './HyperledgerService';
import { Wallet, X509Identity } from 'fabric-network';
import { initializeCouchDBWallet, getUserWallet } from '../utils/walletUtils';
import { config } from '../config';

class UserIdentityService {
    private wallet: Wallet;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        this.wallet = await initializeCouchDBWallet();
    }

    async getUserIdentity(username: string): Promise<X509Identity | undefined> {
        try {
            return await getUserWallet(this.wallet, username);
        } catch (error) {
            console.error('Error al obtener la identidad del usuario:', error);
            throw error;
        }
    }

    async registerIdentityWithAddress(username: string, email: string, walletAddress: string) {
        const registrar = HyperledgerService.getRegistrar();
        const fabricCAServices = HyperledgerService.getFabricCAServices();

        const secret = await fabricCAServices.register({
            enrollmentID: username,
            affiliation: "",
            role: "client",
            attrs: [
                { name: "walletAddress", value: walletAddress, ecert: true },
                { name: "email", value: email, ecert: true }
            ],
            maxEnrollments: -1
        }, registrar);

        const enrollment = await fabricCAServices.enroll({
            enrollmentID: username,
            enrollmentSecret: secret,
        });

        const newIdentity: X509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: config.mspID,
            type: 'X.509',
        };
        await this.wallet.put(username, newIdentity);
    }

    // More methods could be added below reenroll, revoke, etc.
}

export default new UserIdentityService();
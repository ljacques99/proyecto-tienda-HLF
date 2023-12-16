import HyperledgerService from './HyperledgerService';
import UserIdentityService from './UserIdentityService';
import { config } from '../config';
import { createToken, createSignUpToken } from '../utils/jwtUtils';
import { addUser, getUser, findUserByWalletAddress } from '../utils/userUtils';

class AuthService {
    static async verifyAddressAuthority(walletAddress: string) {
        try {
            const token = createSignUpToken({ walletAddress: walletAddress });
            return { token };
        } catch (err) {
            throw new Error(err.message);
        }
    }

    static async signUpWithWallet(username: string, email: string, walletAddress: string) {
        const identityService = HyperledgerService.getIdentityService();
        const registrar = HyperledgerService.getRegistrar();

        try {
            const identityFound = await identityService.getOne(username, registrar);
            if (identityFound) {
                return { error: "Username already taken" };
            }            

        } catch (err) {
            const userInOrg = err?.errors.some(err => err.code === 63)
            if (!userInOrg) return { error: err }
            const identitiesFound = await identityService.getAll(registrar);

            const users = identitiesFound?.result?.identities;
            const user = findUserByWalletAddress(users, walletAddress);
            if (user) {
                return { error: "Wallet address already taken" };
            }
            await UserIdentityService.registerIdentityWithAddress(username, email, walletAddress)
            
            return { error: null }
        }
    }

    // static async login(username: string, password: string) {
    //     const identityService = HyperledgerService.getIdentityService();
    //     const registrar = HyperledgerService.getRegistrar();

    //     try {
    //         const identityFound = await identityService.getOne(username, registrar);
    //         if (!identityFound) {
    //             throw new Error("Username not found");
    //         }

    //         const fabricCAServices = HyperledgerService.getFabricCAServices();
    //         // Verificación de que el username y password son correctas.
    //         const enrollment = await fabricCAServices.enroll({
    //             enrollmentID: username,
    //             enrollmentSecret: password,
    //         });

    //         addUser(username, {
    //             certificate: enrollment.certificate,
    //             rootCertificate: enrollment.rootCertificate,
    //             key: enrollment.key
    //         })

    //         const token = createToken({ username, mspID: config.mspID });
    //         return { token };
    //     } catch (e) {
    //         throw new Error(e.message);
    //     }
    // }

    static async loginWithAddress(walletAddress: string) {
        const identityService = HyperledgerService.getIdentityService();
        const registrar = HyperledgerService.getRegistrar();

        try {
            const identityFound = await identityService.getAll(registrar);
            if (!identityFound) {
                throw new Error("No identities available");
            }

            const users = identityFound?.result?.identities;
            const user = findUserByWalletAddress(users, walletAddress);

            if (!user) {
                throw new Error("User not found");
            }

            // const userIsLoggedIn = getUser(user.id)

            const identity = await UserIdentityService.getUserIdentity(user.id)
            
            if (!identity) {
                // hacer revoke y regiser - keep track on side DB using boolean revoke to match when findUserByWalletAddress
                // const email = user.attrs.find(attr => attr.name === 'email')
                // const walletAddress = user.attrs.find(attr => attr.name === 'walletAddress')
                // const newUsername = await UserIdentityService.revokeIdentityWithAddress(user.id, email.value, walletAddress.value)
                // const token = createToken({ username: newUsername, mspID: config.mspID, walletAddress: walletAddress });
                // return { token };
                throw new Error('This user and wallet has been deprecated')
            }
            
            // addUser(user.id, { isConnected: true })
            const token = createToken({ username: user.id, mspID: config.mspID, walletAddress: walletAddress });
            console.log(`
        An identity has logged in!
        - Identity: ${user.id} 
        - Address: ${walletAddress}
        - mspID: ${config.mspID}
            `)
            return { token };
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

export default AuthService;
import { ConnectOptions, connect, signers } from '@hyperledger/fabric-gateway';
import "reflect-metadata";
import * as grpc from '@grpc/grpc-js';
import * as crypto from 'crypto';
import HyperledgerService from '../services/HyperledgerService'; // Asegúrate de que esta importación sea correcta
import UserIdentityService from '../services/UserIdentityService';

// Función para crear una nueva conexión gRPC
async function newGrpcConnection(peerEndpoint: string, tlsRootCert: Buffer): Promise<grpc.Client> {
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {});
}

export async function newConnectOptions(
    client: grpc.Client,
    mspId: string,
    certificatePem: string,
    privateKeyPem: string
): Promise<ConnectOptions> {
    const identity = { mspId, credentials: Buffer.from(certificatePem) };
    const signer = signers.newPrivateKeySigner(crypto.createPrivateKey(privateKeyPem));

    return {
        client,
        identity,
        signer,
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    };
}


// Función principal para conectar al Gateway y obtener un contrato
export async function connectGateway(username: string, contractName: string) {
    try {
        // Obtener detalles del peer y CA desde HyperledgerService
        const { peerEndpoint, tlsRootCert } = HyperledgerService.getPeerDetails();
        const grpcConn = await newGrpcConnection(peerEndpoint, tlsRootCert);

        // Obtener identidad y firmante del usuario
        const userIdentity = await UserIdentityService.getUserIdentity(username);

        if (!userIdentity) throw ('This user needs to reenroll')
        if (!contractName) throw ('The contract needs to be provided')

        const connectOptions = await newConnectOptions(
            grpcConn,
            userIdentity.mspId,
            userIdentity.credentials.certificate,
            userIdentity.credentials.privateKey
        );
        // const gateway = new Gateway();
        const gateway = connect(connectOptions);

        // Obtener el contrato del canal especificado
        const network = gateway.getNetwork(HyperledgerService.getChannelName());
        const contract = network.getContract(HyperledgerService.getChaincodeName(), contractName);
        return contract;
    } catch (error) {
        console.error('Error connecting to Gateway:', error);
        throw error;
    }
}
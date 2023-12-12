import FabricCAServices from "fabric-ca-client";
import { User } from "fabric-common";
import { newGrpcConnection } from '../utils';
import * as fs from 'fs';
import * as yaml from "yaml";
import { config } from '../config';
import * as _ from "lodash";

class HyperledgerService {
    private static fabricCAServices: FabricCAServices;
    private static identityService: any;
    private static registrar: User;

    static async init() {
        const networkConfig = yaml.parse(await fs.promises.readFile(config.networkConfigPath, 'utf8'));

        // Configuración de los peers
        const orgPeerNames = _.get(networkConfig, `organizations.${config.mspID}.peers`);
        if (!orgPeerNames) {
            throw new Error(`Organization ${config.mspID} doesn't have any peers`);
        }

        let peerUrl: string = "";
        let peerCACert: string = "";

        for (const peerName of orgPeerNames) {
            const peer = networkConfig.peers[peerName];
            peerUrl = _.get(peer, 'url').replace("grpcs://", "");
            peerCACert = _.get(peer, 'tlsCACerts.pem');
            break; // Salir después del primer peer
        }

        if (!peerUrl || !peerCACert) {
            throw new Error(`Organization ${config.mspID} doesn't have any peers`);
        }

        // Configuración de la Autoridad de Certificación (CA)
        const ca = networkConfig.certificateAuthorities[config.caName];
        if (!ca) {
            throw new Error(`Certificate authority ${config.caName} not found in network configuration`);
        }

        const caURL = ca.url;
        if (!caURL) {
            throw new Error(`Certificate authority ${config.caName} does not have a URL`);
        }

        this.fabricCAServices = new FabricCAServices(caURL, {
            trustedRoots: [ca.tlsCACerts.pem[0]],
            verify: true,
        }, ca.caName);

        this.identityService = this.fabricCAServices.newIdentityService();

        // Registro del usuario que actuará como registrador
        const registrarUserResponse = await this.fabricCAServices.enroll({
            enrollmentID: ca.registrar.enrollId,
            enrollmentSecret: ca.registrar.enrollSecret
        });

        this.registrar = User.createUser(
            ca.registrar.enrollId,
            ca.registrar.enrollSecret,
            config.mspID,
            registrarUserResponse.certificate,
            registrarUserResponse.key.toBytes()
        );
    }

    static getFabricCAServices() {
        return this.fabricCAServices;
    }

    static getIdentityService() {
        return this.identityService;
    }

    static getRegistrar() {
        return this.registrar;
    }

    // Hyperledger Fabric
}

export default HyperledgerService;
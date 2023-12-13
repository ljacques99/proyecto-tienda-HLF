import FabricCAServices from "fabric-ca-client";
import { User } from "fabric-common";
import * as fs from 'fs';
import * as yaml from "yaml";
import { config } from '../config';
import * as _ from "lodash";

class HyperledgerService {
    private static fabricCAServices: FabricCAServices;
    private static identityService: any;
    private static registrar: User;
    private static networkConfig: any;

    static async init() {
        this.networkConfig = yaml.parse(await fs.promises.readFile(config.networkConfigPath, 'utf8'));

        // Configuración de los peers
        const orgPeerNames = _.get(this.networkConfig, `organizations.${config.mspID}.peers`);
        if (!orgPeerNames) {
            throw new Error(`Organization ${config.mspID} doesn't have any peers`);
        }

        let peerUrl: string = "";
        let peerCACert: string = "";

        for (const peerName of orgPeerNames) {
            const peer = this.networkConfig.peers[peerName];
            peerUrl = _.get(peer, 'url').replace("grpcs://", "");
            peerCACert = _.get(peer, 'tlsCACerts.pem');
            break; // Salir después del primer peer
        }

        if (!peerUrl || !peerCACert) {
            throw new Error(`Organization ${config.mspID} doesn't have any peers`);
        }

        // Configuración de la Autoridad de Certificación (CA)
        const ca = this.networkConfig.certificateAuthorities[config.caName];
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

    static getPeerDetails() {
        const peerName = Object.keys(this.networkConfig.peers)[0]; // Asume el primer peer
        const peer = this.networkConfig.peers[peerName];
        return {
            peerEndpoint: _.get(peer, 'url').replace('grpcs://', ''),
            tlsRootCert: Buffer.from(_.get(peer, 'tlsCACerts.pem')),
        };
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

    static getConnectionProfile() {
        return this.networkConfig;
    }

    static getChannelName() {
        return config.channelName
    }

    static getChaincodeName() {
        return config.chaincodeName
    }

    // Hyperledger Fabric
}

export default HyperledgerService;
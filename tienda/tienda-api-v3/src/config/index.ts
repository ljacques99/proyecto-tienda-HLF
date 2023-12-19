export interface Config {
    caName: string;
    channelName: string;
    chaincodeName: string;
    mspID: string;
    hlfUser: string;
    networkConfigPath: string;
    providerURL: string;
    chainId: number;
    contractAddressPath: string;
    abiFilePath: string;
    ownerFilePath: string;
    ownerPrivateKey: string;
    contractAddress: string;
    bridgeContractPath: string;
}

export const config: Config = {
    caName: process.env.CA_NAME || '',
    channelName: process.env.CHANNEL_NAME || '',
    chaincodeName: process.env.CHAINCODE_NAME || '',
    mspID: process.env.MSP_ID || '',
    hlfUser: process.env.HLF_USER || '',
    networkConfigPath: process.env.NETWORK_CONFIG_PATH || '',
    providerURL: process.env.PROVIDER_URL || '',
    chainId: parseInt(process.env.CHAIN_ID || '0'),
    contractAddressPath: process.env.CONTRACT_ADDRESS_PATH || '',
    abiFilePath: process.env.ABI_FILE_PATH || '',
    ownerFilePath: process.env.OWNER_FILE_PATH || '',
    ownerPrivateKey: process.env.OWNER_PRIVATE_KEY || '',
    contractAddress: process.env.BRIDGE_ADDRESS || '',
    bridgeContractPath: process.env.BRIDGE_CONTRACT_PATH || ''
}

export function checkConfig() {
    const requiredConfigs = [
        'caName',
        'channelName',
        'chaincodeName',
        'mspID',
        'hlfUser',
        'networkConfigPath',
        'providerURL',
        'chainId',
        'providerURL',
        'bridgeContractPath',
        'ownerPrivateKey'
    ];

    for (const key of requiredConfigs) {
        if (!config[key as keyof Config]) {
            throw new Error(`${key} is not set`);
        }
    }
}
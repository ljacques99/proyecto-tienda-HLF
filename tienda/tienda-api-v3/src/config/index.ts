export interface Config {
    caName: string;
    channelName: string;
    chaincodeName: string;
    mspID: string;
    hlfUser: string;
    networkConfigPath: string;
}

export const config: Config = {
    caName: process.env.CA_NAME || '',
    channelName: process.env.CHANNEL_NAME || '',
    chaincodeName: process.env.CHAINCODE_NAME || '',
    mspID: process.env.MSP_ID || '',
    hlfUser: process.env.HLF_USER || '',
    networkConfigPath: process.env.NETWORK_CONFIG_PATH || '',
}

export function checkConfig() {
    const requiredConfigs = [
        'caName',
        'channelName',
        'chaincodeName',
        'mspID',
        'hlfUser',
        'networkConfigPath'
    ];

    for (const key of requiredConfigs) {
        if (!config[key as keyof Config]) {
            throw new Error(`${key} is not set`);
        }
    }
}
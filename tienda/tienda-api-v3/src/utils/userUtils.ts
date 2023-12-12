export function findUserByWalletAddress(users: any[], walletAddress: string) {
    const address = walletAddress.toLowerCase();
    for (const user of users) {
        const walletAttr = user.attrs.find(attr => attr.name === 'walletAddress' && attr.value.toLowerCase() === address);
        if (walletAttr) {
            return user;
        }
    }
    return null;
}

interface UserRecord {
    isConnected: boolean
}

const userStore = new Map<string, UserRecord>();

export const addUser = (username: string, userRecord: UserRecord) => {
  userStore.set(username, userRecord);
};

export const getUser = (username: string): UserRecord | undefined => {
  return userStore.get(username);
};

// se pueden añadir más funciones útiles como removeUser, etc.
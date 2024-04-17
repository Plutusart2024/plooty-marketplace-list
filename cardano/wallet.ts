export const supportedWallets = ["nami", "flint", "eternl"] as const;
export type SupportedWallet = typeof supportedWallets[number];

export type Paginate = {
  page: number;
  limit: number;
};

export type WalletApiCip0030 = {
  enable: () => Promise<WalletApiCip0030>;
  isEnabled: () => Promise<boolean>;
  apiVersion: () => Promise<string>;
  name: () => Promise<string>;
  icon: () => Promise<string>;
  getNetworkId: () => Promise<number>;
  getUtxos: (amount?: string, paginate?: Paginate) => Promise<string[]>;
  getBalance: () => Promise<string>;
  getUsedAddresses: (paginate?: Paginate) => Promise<string[]>;
  getUnusedAddresses: () => Promise<string[]>;
  getChangeAddress: () => Promise<string>;
  getRewardAddresses: () => Promise<string[]>;
  signTx: (tx: string, partialSign: boolean) => Promise<string>;
  signData: (addr: string, payload: string) => Promise<string>;
  submitTx: (tx: string) => Promise<string>;
};

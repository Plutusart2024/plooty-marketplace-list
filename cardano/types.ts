export enum RedeemAction {
  Cancel = 0,
}

export enum OrderType {
  SellOrder = 30,
}

export type Royalty = {
  address: string;
  rate: number;
};

export type ListingParams = {
  policyId: string;
  tokenNameHex: string;
  price: number;
  royalty?: Royalty;
};

export type Payout = {
  addr: string;
  lovelace: number;
};

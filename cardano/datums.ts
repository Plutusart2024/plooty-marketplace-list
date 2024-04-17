import { Construct, Data } from "lucid-cardano";
import { Payout, ListingParams } from "@cardano/types";
import { addrToKeyHashes, makePayouts } from "@utils";

export function buildDatum(
  datumParams: ListingParams & { sellerAddr: string }
) {
  const sellerPkhHex = addrToKeyHashes(datumParams.sellerAddr).paymentCredHex;

  const payouts = makePayouts(datumParams);
  const payoutsData = [];
  for (const payout of payouts) {
    payoutsData.push(payoutToData(payout));
  }

  const datumFields = [sellerPkhHex, payoutsData];
  const fullData = new Construct(0, datumFields);
  return Data.to(fullData);
}

export function addrToData(addr: string) {
  const addrKeyHashes = addrToKeyHashes(addr);
  const paymentCredData = new Construct(0, [addrKeyHashes.paymentCredHex]);
  const stakingCredData = new Construct(0, [
    new Construct(0, [new Construct(0, [addrKeyHashes.stakeCredHex])]),
  ]);
  return new Construct(0, [paymentCredData, stakingCredData]);
}

export function payoutToData(payout: Payout) {
  const payoutValue = new Map([
    ["", new Construct(0, [0, new Map([["", payout.lovelace]])])],
  ]);
  return new Construct(0, [addrToData(payout.addr), payoutValue]);
}

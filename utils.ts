import { ListingParams, Payout, Royalty } from "@cardano/types";
import { jpgV2Config } from "config";
import { C } from "lucid-cardano";
import { StakeCredential } from "lucid-cardano/custom_modules/cardano-multiplatform-lib-browser";
import { OrderType } from "@cardano/types";
import { fromHex } from "lucid-cardano";

export const toHex = (str: Uint8Array) => {
  return Buffer.from(str).toString("hex");
};

export function splitPrice(price: number, royalty: Royalty | undefined) {
  const feeLovelace = Math.max(
    jpgV2Config.minFee,
    Math.floor(price * jpgV2Config.feeRate)
  );
  const royaltyLovelace =
    royalty && royalty.rate > 0
      ? Math.max(jpgV2Config.minRoyalty, Math.floor(price * royalty.rate))
      : 0;
  return {
    sellerLovelace: price - feeLovelace - royaltyLovelace,
    feeLovelace,
    royaltyLovelace,
  };
}

export function makePayouts(
  datumParams: ListingParams & { sellerAddr: string }
): Payout[] {
  const payoutValues = splitPrice(datumParams.price, datumParams.royalty);
  const payouts = [];
  if (datumParams.royalty && payoutValues.royaltyLovelace > 0) {
    payouts.push({
      addr: datumParams.royalty.address,
      lovelace: payoutValues.royaltyLovelace,
    });
  }
  payouts.push({
    addr: jpgV2Config.feeAddr,
    lovelace: payoutValues.feeLovelace,
  });
  payouts.push({
    addr: datumParams.sellerAddr,
    lovelace: payoutValues.sellerLovelace,
  });
  return payouts;
}

export function addrToKeyHashes(addr: string) {
  const baseAddr = C.BaseAddress.from_address(C.Address.from_bech32(addr));
  const toKeyHashBytes = (cred?: StakeCredential) => {
    return cred?.to_keyhash()?.to_bytes();
  };
  const paymentCredBytes = toKeyHashBytes(baseAddr?.payment_cred());
  const stakeCredBytes = toKeyHashBytes(baseAddr?.stake_cred());
  if (!paymentCredBytes || !stakeCredBytes) {
    throw new Error("UNEXPECTED_ADDR_TYPE");
  }
  return {
    paymentCredHex: toHex(paymentCredBytes),
    stakeCredHex: toHex(stakeCredBytes),
  };
}

export function makeMetadataFromDatum(type: OrderType, datum: string) {
  // Greedily split the datum into pieces of length at most 64
  const splitDatumParts = datum.match(/.{1,64}/g);
  if (!splitDatumParts) {
    throw new Error("UNKNOWN_ERROR");
  }
  const metadataEntries: [number, string][] = [];
  for (const [label, metadataRow] of [...splitDatumParts].entries()) {
    metadataEntries.push([label, metadataRow]);
  }
  metadataEntries.push([30, "2"]);
  if (type != OrderType.SellOrder) {
    throw new Error("NOT_IMPLEMENTED");
  }
  return metadataEntries;
}

export function hashDatum(datum: string) {
  return C.hash_plutus_data(C.PlutusData.from_bytes(fromHex(datum))).to_hex();
}

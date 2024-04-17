import { Lucid, Data, Construct, C, fromHex, Tx } from "lucid-cardano";
import { jpgV2Config } from "config";
import { ListingParams, RedeemAction, OrderType } from "@cardano/types";
import { buildDatum } from "@cardano/datums";
import { makeMetadataFromDatum, hashDatum } from "@utils";

function makeRedeemer(action: RedeemAction) {
  return Data.to(new Construct(action, []));
}

async function attachJpgMetadataToTx(type: OrderType, tx: Tx, datum: string) {
  for (const [key, value] of makeMetadataFromDatum(type, datum)) {
    tx = await tx.attachMetadata(key, value);
  }
  return tx;
}

export async function makeJpgV2Listing(
  listingParams: ListingParams,
  lucid: Lucid
): Promise<string> {
  const sellerAddr = await lucid.wallet.address();

  const listingDatum = buildDatum({ ...listingParams, sellerAddr });

  const txWithMetadataOnly = await attachJpgMetadataToTx(
    OrderType.SellOrder,
    await lucid.newTx(),
    listingDatum
  );
  const tx = await txWithMetadataOnly
    .payToContract(jpgV2Config.scriptAddr, listingDatum, {
      lovelace: BigInt(2000000),
      [listingParams.policyId + listingParams.tokenNameHex]: BigInt(1),
    })
    .complete();

  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();
  return txHash;
}

export async function cancelJpgV2Listing(
  listingParams: ListingParams,
  lucid: Lucid
): Promise<string> {
  const sellerAddr = await lucid.wallet.address();

  const listingDatum = buildDatum({ ...listingParams, sellerAddr });
  const listingDatumHashHex = hashDatum(listingDatum);

  const listingUtxos = (
    await lucid.utxosAtWithUnit(
      jpgV2Config.scriptAddr,
      listingParams.policyId + listingParams.tokenNameHex
    )
  ).filter((utxo) => {
    return utxo.datumHash == listingDatumHashHex;
  });
  if (listingUtxos.length == 0) {
    throw new Error("NOT_IN_SCRIPT");
  }

  const tx = await lucid
    .newTx()
    .collectFrom([listingUtxos[0]], makeRedeemer(RedeemAction.Cancel))
    .attachSpendingValidator(jpgV2Config.script)
    .addSigner(sellerAddr)
    .payToAddress(sellerAddr, { lovelace: BigInt(2000000) }) // To avoid not enough ADA for minADA...
    .complete({ datum: listingDatum });

  const signedTx = await tx.sign().complete();

  const txHash = await signedTx.submit();

  return txHash;
}

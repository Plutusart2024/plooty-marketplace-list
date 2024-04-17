import React, { useState } from "react";
import { makeJpgV2Listing, cancelJpgV2Listing } from "@cardano/transactions";
import { Lucid } from "lucid-cardano";
import { ListingParams, Royalty } from "@cardano/types";

function NftForm(props: {lucid: Lucid}) {

    const [policyId, setPolicyId] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [price, setPrice] = useState(10000000);
    const [royaltyAddr, setRoyaltyAddr] = useState("");
    const [royaltyRate, setRoyaltyRate] = useState(0);

    const getCurrentListingParams = (): ListingParams => {
        return {
            policyId,
            tokenNameHex: Buffer.from(tokenName, "utf-8").toString("hex"),
            price,
            royalty: royaltyAddr !== "" && royaltyRate !== 0 ? {
                address: royaltyAddr,
                rate: royaltyRate
            } as Royalty : undefined
        }
    }

    const handleUsingFn = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, fn: typeof makeJpgV2Listing | typeof cancelJpgV2Listing) => {
        e.preventDefault();
        const txHash = await fn(getCurrentListingParams(), props.lucid);
        alert(`Submitted txId: ${txHash}`);
    }

    return (
        <form>
            <label htmlFor="policy-id">Policy ID</label>
            <input id="policy-id" type="text" value={policyId} onChange={(e) => setPolicyId(e.currentTarget.value)} />
            <br/>
            <label htmlFor="token-name">Token name</label>
            <input id="token-name" type="text" value={tokenName} onChange={(e) => setTokenName(e.currentTarget.value)} />
            <br/>
            <label htmlFor="price">Price (lovelace)</label>
            <input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.currentTarget.value))} />
            <br/>
            <label htmlFor="royalty-addr">Royalty address</label>
            <input id="royalty-addr" type="text" value={royaltyAddr} onChange={(e) => setRoyaltyAddr(e.currentTarget.value)} />
            <br/>
            <label htmlFor="royalty-rate">Royalty rate</label>
            <input id="royalty-rate" type="number" value={royaltyRate} onChange={(e) => setRoyaltyRate(Number(e.currentTarget.value))} />
            <br/>
            <button onClick={(e) => handleUsingFn(e, makeJpgV2Listing)}>List</button>
            <button onClick={(e) => handleUsingFn(e, cancelJpgV2Listing)}>Cancel</button>
        </form>
    );
}

export default NftForm;
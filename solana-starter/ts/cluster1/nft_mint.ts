import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../turbin3-wallet.json"
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

// nft https://explorer.solana.com/address/5dXzbYS8iW1ym2uEEKRazZh3Z6HssEpJoYdNy96AU1Rt?cluster=devnet

(async () => {
    let tx = createNft(umi, {
        mint: generateSigner(umi),
        name: "Generug Best Rug",
        symbol: "GRBR",
        uri: "https://gateway.irys.xyz/7ybhHZLxso2shuT6iDuTpPsLQwkCR9duNrYno4HS9dR7",
        updateAuthority: keypair.publicKey,
        sellerFeeBasisPoints: percentAmount(5),
    })
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);
    
    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

    console.log("Mint Address: ", mint.publicKey);
})();
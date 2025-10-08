import { Keypair, Connection, Commitment } from "@solana/web3.js";
import { createMint } from '@solana/spl-token';
import wallet from "../turbin3-wallet.json"
import { keypairPayer } from "@metaplex-foundation/umi";

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// created mint address Hpbn3zRnnKUHYhDBKAqx8pss3zvbqEg4qb8nEMu2rGVa

(async () => {
    try {
        // Start here
        // const mint = ???
        // default token program id
        const mint = await createMint(
            connection,
            keypair,
            keypair.publicKey,
            keypair.publicKey,
            6,
        )
        console.log(`Mint address: ${mint.toBase58()}`);
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()

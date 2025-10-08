import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../turbin3-wallet.json"
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("Hpbn3zRnnKUHYhDBKAqx8pss3zvbqEg4qb8nEMu2rGVa");
const token_decimals = 1_000_000n;

// Recipient address
const to = new PublicKey("EfDWrJMpg3ExKSYQZWnCKQrZMFAa3xmuJGzmkiKNov63");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const ata = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey,
        )
        // const ata = getAssociatedTokenAddressSync(
        //     mint,
        //     keypair.publicKey,
        // )
        // const ata = createAssociatedTokenAccountInstruction()
        console.log(`Your ata is: ${ata.address.toBase58()}`);

        const toAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            to,
        )
        // const toAta = getAssociatedTokenAddressSync(
        //     mint,
        //     to
        // )
        // const toAta = PublicKey.findProgramAddressSync(
        //     [to.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        //     ASSOCIATED_TOKEN_PROGRAM_ID,
        // )[0]
        console.log(`Your to ata is: ${toAta.address.toBase58()}`);

        const transferTx = await transfer(
            connection,
            keypair,
            ata.address,
            toAta.address,
            keypair,
            1_000n * token_decimals,
        )
        console.log(`Your transfer txid: ${transferTx}`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
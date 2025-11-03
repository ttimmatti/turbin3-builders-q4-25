import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PrivatePayments } from "../target/types/private_payments";
import {
  groupPdaFromId,
  PERMISSION_PROGRAM_ID,
  permissionPdaFromAccount,
} from "@magicblock-labs/ephemeral-rollups-sdk/privacy";
import { DEPOSIT_PDA_SEED, VAULT_PDA_SEED } from "../frontend/lib/constants";
import privatePaymentsIdl from "../target/idl/private_payments.json";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotent,
  createMint,
  getAccount,
  getAssociatedTokenAddressSync,
  mintToChecked,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";
import {
  Transaction,
  SystemProgram,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { readFileSync } from "fs";
import { SessionTokenManager } from "@magicblock-labs/gum-sdk";

// localnet validator
const LOCALNET_ER_VALIDATOR = new PublicKey(
  "mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev"
);

// static keys for users for easier debuggin
const userSecretKey = readFileSync("tmp/user.json");
const otherUserSecretKey = readFileSync("tmp/otherUser.json");
const userKp = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(userSecretKey.toString()))
);
const otherUserKp = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(otherUserSecretKey.toString()))
);

describe("session-private-transfers", () => {
  const wallet = new anchor.Wallet(userKp);

  const provider = new anchor.AnchorProvider(
    new anchor.web3.Connection("http://localhost:8899", {
      wsEndpoint: "ws://localhost:8900",
      commitment: "confirmed",
    }),
    wallet
  );
  const ephemeralProvider = new anchor.AnchorProvider(
    new anchor.web3.Connection("http://localhost:7799", {
      wsEndpoint: "ws://localhost:7800",
      commitment: "confirmed",
    }),
    wallet
  );
  anchor.setProvider(provider);

  const program = new Program<PrivatePayments>(privatePaymentsIdl, provider);
  const ephemeralProgram = new Program<PrivatePayments>(
    privatePaymentsIdl,
    ephemeralProvider
  );
  const user = userKp.publicKey;
  const otherUser = otherUserKp.publicKey;
  let tokenMint: PublicKey,
    userTokenAccount: PublicKey,
    otherUserTokenAccount: PublicKey,
    vaultPda: PublicKey,
    vaultTokenAccount: PublicKey;
  const initialAmount = 1000000;
  const groupId = PublicKey.unique();
  const otherGroupId = PublicKey.unique();
  let depositPda: PublicKey, otherDepositPda: PublicKey;

  before(async () => {
    const faucet = anchor.Wallet.local();

    // Airdrop SOL to the users
    for (const kp of [userKp, otherUserKp]) {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: faucet.publicKey,
          toPubkey: kp.publicKey,
          lamports: 0.1 * LAMPORTS_PER_SOL,
        })
      );
      tx.recentBlockhash = (
        await provider.connection.getLatestBlockhash()
      ).blockhash;
      tx.feePayer = faucet.publicKey;
      let signedTx = await faucet.signTransaction(tx);
      let rawTx = signedTx.serialize();
      let sig = await provider.connection.sendRawTransaction(rawTx);
      await provider.connection.confirmTransaction(sig);
    }

    let balance = await provider.connection.getBalance(userKp.publicKey);
    console.log("Balance", balance);
    while (balance === 0) {
      console.log("Airdropping...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      balance = await provider.connection.getBalance(userKp.publicKey);
    }
    if (balance === 0) throw new Error("airdrop failed...");

    
  });

  it("Create session", async () => {
    const sessionKp = Keypair.generate();
    const sessionManager = new SessionTokenManager(wallet, provider.connection);
    const sessionToken = PublicKey.findProgramAddressSync(
      [
        Buffer.from("session_token"),
        program.programId.toBuffer(),
        sessionKp.publicKey.toBuffer(),
        wallet.publicKey.toBuffer(),
      ],
      sessionManager.program.programId
    )[0];
    const sig = await sessionManager.program.methods
      .createSession(true, null, null)
      .accountsPartial({
        sessionToken,
        sessionSigner: sessionKp.publicKey,
        authority: wallet.publicKey,
        targetProgram: program.programId,
      })
      .signers([userKp, sessionKp])
      .rpc({ skipPreflight: true });
    // const sig = await provider.connection.sendRawTransaction(
    //   createSessionTx.serialize()
    // );
    await provider.connection.confirmTransaction(sig);
    console.log("Sig create session", sig);

    const session = await sessionManager.program.account.sessionToken.fetch(
      sessionToken
    );
    console.log("Session", session);
  });
});

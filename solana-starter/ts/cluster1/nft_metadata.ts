import wallet from "../turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

// https://gateway.irys.xyz/5BDAvhxN6GpvecHswnbSDhzmmwMbRLhWbXFW44ptK65g
// umi.use(irysUploader({address: "https://devnet.irys.xyz/",}));
umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        const image = "https://gateway.irys.xyz/5BDAvhxN6GpvecHswnbSDhzmmwMbRLhWbXFW44ptK65g"
        const metadata = {
            name: "Generug Best Rug",
            symbol: "GRBR",
            description: "Best rug on the blockchain. Yes, it's a rug.",
            image: image,
            attributes: [
                {trait_type: 'accent', value: 'green'}
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: image
                    },
                ]
            },
            creators: [keypair.publicKey]
        };

        const myUri = await umi.uploader.uploadJson(metadata);
        console.log("Your metadata URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();

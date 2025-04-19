import{
    CollectionMasterEditionAccountInvalidError,
    createNft,
    fetchDigitalAsset,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata"
import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
} from "@solana-developers/helpers"
import {createUmi} from "@metaplex-foundation/umi-bundle-defaults"
import {
    clusterApiUrl,
    Connection,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js"
import { 
    generateSigner,
    Keypair, 
    keypairIdentity, 
    percentAmount,
    publicKey 
} from "@metaplex-foundation/umi";

async function main (){
    const connection = new Connection(clusterApiUrl("devnet"));
// If file not specified then, by default id.json will be used located at home.
const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);
console.log("User Loaded: ", user.publicKey.toBase58());
//Initializing Umi instance
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());
//Umi copy for user keypair. Uses own format for keypair.

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionAddress = publicKey("2s3SsvNnaxywWyqzeYi3rBtLhTEVM9e9g9Gpm5VVdj1s");

console.log("Creating NFT...");

const mint = generateSigner(umi);

try {
    const transaction = await createNft(umi, {
        mint,
        name: "Tree-1",
        uri: "https://raw.githubusercontent.com/TaimoorKhan101/NFT/refs/heads/main/tree-1.json",
        sellerFeeBasisPoints: percentAmount(0),
        collection: {
            key: collectionAddress,
            verified: false,
        },
    });
    
    await transaction.sendAndConfirm(umi);
    
    const createdNft = await fetchDigitalAsset(umi, mint.publicKey);
    
    console.log(`NFT created at Address: ${getExplorerLink("address", createdNft.mint.publicKey, "devnet")}`);    
} catch (error) {
    console.error("Error creating NFT:", error);
}


}
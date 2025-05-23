import{
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
import { generateSigner, Keypair, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";

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

const collectionMint = generateSigner(umi);
//Created NFT to represent collection.
const transaction = await createNft(umi, {
    mint: collectionMint,
    name: "Tree Collection",
    symbol: "ECO",
    uri: "https://raw.githubusercontent.com/TaimoorKhan101/NFT/refs/heads/main/tree.json",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
} ).sendAndConfirm(umi);

try {
    const createdCollectionNft = await fetchDigitalAsset(
        umi,
        collectionMint.publicKey,
    );
    
    console.log(`Collection NFT Created at Address: ${getExplorerLink("address", createdCollectionNft.mint.publicKey, "devnet")}`);    
} catch (error) {
    console.log("Error fetching collection NFT:", error);
}

}

main();

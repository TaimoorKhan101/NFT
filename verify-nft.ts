import{
    createNft,
    fetchDigitalAsset,
    findMetadataPda,
    mplTokenMetadata,
    verifyCollectionV1,
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
import { generateSigner, Keypair, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";

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
const nftAddress = publicKey("GnpFqtcEJwxkR9TSTMQ7GvkbZH2uutL1kkUZzTnEXqb2");

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, {mint: nftAddress}),
    collectionMint: collectionAddress,
    authority: umi.identity
});

transaction.sendAndConfirm(umi);

console.log(`NFT ${nftAddress} Verified as member of ${collectionAddress} Collection. See Explorer at ${getExplorerLink(
    "address",
    nftAddress,
    "devnet"
)}`
);

}

main();
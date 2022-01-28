import { ethers, getNamedAccounts } from 'hardhat';
import { CODEToken } from '../../next-app/src/typechain';

const args = process.argv.slice(2);
const merkleRoot = args[0];

async function main() {
  const { deployer } = await getNamedAccounts();

  const tokenContract = <CODEToken>await ethers.getContract('CODEToken', deployer);
  const tx = await tokenContract.setMerkleRoot(merkleRoot);
  console.log(`Setting merkle root "${merkleRoot}"`);
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import { ethers } from 'ethers';
import * as fs from 'fs';

const TOKEN_AMOUNT_NFT = 400;
const TOKEN_AMOUNT_VOTES_POAP = 399;

const args = process.argv.slice(2);
const nftHoldersPath = args[0];
const votesAndPoapPath = args[1];

// TODO early contributors allocation, founding team, advisors, partners

if (!nftHoldersPath) throw new Error('Missing nftHoldersPath as first argument!');
if (!votesAndPoapPath) throw new Error('Missing earlyContribPath as second argument!');

async function main() {
  // Load addresses
  const nftHolders = JSON.parse(fs.readFileSync(nftHoldersPath).toString());
  const votersAndPoapHolders = JSON.parse(fs.readFileSync(votesAndPoapPath).toString());

  // Create the airdrop structure required by the generator
  const airdropForUI: Record<string, { nft: number; voter: number; earlyContrib: number }> = {};

  // NFT Holders allocation
  nftHolders.addresses.forEach((address: string) => {
    const formattedAddress = ethers.utils.getAddress(address);

    airdropForUI[formattedAddress] = {
      nft: TOKEN_AMOUNT_NFT,
      voter: 0,
      earlyContrib: 0,
    };
  });

  // Voters & POAP holders allocation
  votersAndPoapHolders.eligible_address.forEach(({ address }: { address: string }) => {
    const formattedAddress = ethers.utils.getAddress(address);

    if (!(formattedAddress in airdropForUI)) {
      airdropForUI[formattedAddress] = {
        nft: 0,
        voter: TOKEN_AMOUNT_VOTES_POAP,
        earlyContrib: 0,
      };
    } else {
      airdropForUI[formattedAddress].voter = TOKEN_AMOUNT_VOTES_POAP;
    }
  });

  fs.writeFileSync('data/airdrop_ui.json', JSON.stringify({ airdrop: airdropForUI }));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

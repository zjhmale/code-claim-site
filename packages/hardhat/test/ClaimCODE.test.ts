import { expect } from './chai-setup';
import { ethers, deployments, getUnnamedAccounts, getNamedAccounts } from 'hardhat';
import { ClaimCODE, CODE, CODEToken } from '../../next-app/src/typechain';
import { setupUsers } from './utils';
import { generateLeaf } from './utils/merkleUtils';

import MerkleGenerator from '../utils/merkleGenerator';

const TOKEN_DECIMALS = 18;

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['ClaimCODE']);

  const unnamedAccounts = await getUnnamedAccounts();
  const airdrop = {
    [unnamedAccounts[1]]: 100,
    [unnamedAccounts[2]]: 200,
    [unnamedAccounts[3]]: 300,
  };
  console.log(airdrop);

  const generator = new MerkleGenerator(TOKEN_DECIMALS, airdrop);
  const { merkleRoot, merkleTree } = await generator.process();

  const CODE = <CODE>await ethers.getContract('CODE');
  const ClaimCODE = <ClaimCODE>await ethers.getContract('ClaimCODE');
  const users = await setupUsers(unnamedAccounts, { ClaimCODE });

  await ClaimCODE.setMerkleRoot(merkleRoot);

  return {
    CODE,
    ClaimCODE,
    merkleTree,
    users,
    merkleRoot,
  };
});

describe('Claim CODE', function () {
  it('Deployment should assign treasury & airdrop supply of tokens correctly', async function () {
    const { CODE, ClaimCODE } = await setup();
    const { treasury } = await getNamedAccounts();
    const treasuryBalance = await CODE.balanceOf(treasury);
    const airdropBalance = await CODE.balanceOf(ClaimCODE.address);
    expect(treasuryBalance).to.equal(ethers.utils.parseUnits((6_500_000).toString(), TOKEN_DECIMALS));
    expect(airdropBalance).to.equal(ethers.utils.parseUnits((3_500_000).toString(), TOKEN_DECIMALS));
  });

  it('cannot claim if no allocation', async function () {
    const { users, merkleTree } = await setup();

    // Get properly formatted address
    const formattedAddress: string = ethers.utils.getAddress(users[0].address);

    // Get tokens for address
    const numTokens: string = ethers.utils.parseUnits('100', TOKEN_DECIMALS).toString();

    // Generate hashed leaf from address
    const leaf: Buffer = generateLeaf(formattedAddress, numTokens);
    // Generate airdrop proof
    const proof: string[] = merkleTree.getHexProof(leaf);

    await expect(users[0].ClaimCODE.claimTokens(numTokens, proof)).to.be.revertedWith('InvalidProof()');
  });

  it('can claim correct allocation amount only', async function () {
    const { users, merkleTree, CODE, ClaimCODE } = await setup();

    const isClaimed = await ClaimCODE.isClaimed(0);
    expect(isClaimed).to.be.false;

    // Get tokens for address correctly
    const correctFormattedAddress: string = ethers.utils.getAddress(users[1].address);
    const correctNumTokens: string = ethers.utils.parseUnits('100', TOKEN_DECIMALS).toString();
    const correctLeaf: Buffer = generateLeaf(correctFormattedAddress, correctNumTokens);
    const correctProof: string[] = merkleTree.getHexProof(correctLeaf);

    await expect(users[1].ClaimCODE.claimTokens(correctNumTokens, correctProof))
      .to.emit(ClaimCODE, 'Claim')
      .withArgs(correctFormattedAddress, ethers.utils.parseUnits((100).toString(), TOKEN_DECIMALS));

    const userBalance = await CODE.balanceOf(users[1].address);
    expect(userBalance).to.equal(ethers.utils.parseUnits((100).toString(), TOKEN_DECIMALS));

    const isClaimedAfter = await ClaimCODE.isClaimed(0);
    expect(isClaimedAfter).to.be.true;

    await expect(users[1].ClaimCODE.claimTokens(correctNumTokens, correctProof)).to.be.revertedWith(
      'AlreadyClaimed()'
    );
  });

  it('cannot claim if claim period ends', async function () {
    const { users, merkleTree } = await setup();
    // Get properly formatted address
    const formattedAddress: string = ethers.utils.getAddress(users[1].address);

    // Get tokens for address
    const numTokens: string = ethers.utils.parseUnits('100', TOKEN_DECIMALS).toString();

    // Generate hashed leaf from address
    const leaf: Buffer = generateLeaf(formattedAddress, numTokens);
    // Generate airdrop proof
    const proof: string[] = merkleTree.getHexProof(leaf);
    const ninetyOneDays = 91 * 24 * 60 * 60;
    await ethers.provider.send('evm_increaseTime', [ninetyOneDays]);

    await expect(users[1].ClaimCODE.claimTokens(numTokens, proof)).to.be.revertedWith('ClaimEnded()');
  });

  it('cannot reset merkleroot', async function () {
    const { ClaimCODE, merkleRoot } = await setup();
    await expect(ClaimCODE.setMerkleRoot(merkleRoot)).to.be.revertedWith('InitError()');
  });
});

import { expect } from './chai-setup';
import { ethers, deployments, getUnnamedAccounts, getNamedAccounts } from 'hardhat';
import { ClaimCODE, CODE } from '../../next-app/src/typechain';
import { setupUser, setupUsers } from './utils';
import { generateLeaf } from './utils/merkleUtils';

import MerkleGenerator from '../utils/merkleGenerator';

const TOKEN_DECIMALS = 18;

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['CODE', 'ClaimCODE']);

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

  // Grant the Claim contract mint role
  const { treasury } = await getNamedAccounts();
  const treasuryUser = await setupUser(treasury, { CODE });
  const mintRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE'));
  await treasuryUser.CODE.grantRole(mintRole, ClaimCODE.address);

  return {
    CODE,
    ClaimCODE,
    merkleTree,
    users,
  };
});

describe('ClaimCODE', function () {
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

    await expect(users[0].ClaimCODE.claimTokens(numTokens, proof)).to.be.revertedWith('InvalidProof');
  });

  it('can claim correct allocation amount only', async function () {
    const { users, merkleTree, ClaimCODE } = await setup();

    // Get tokens for address correctly
    const correctFormattedAddress: string = ethers.utils.getAddress(users[1].address);
    const correctNumTokens: string = ethers.utils.parseUnits('100', TOKEN_DECIMALS).toString();
    const correctLeaf: Buffer = generateLeaf(correctFormattedAddress, correctNumTokens);
    const correctProof: string[] = merkleTree.getHexProof(correctLeaf);
    await expect(users[1].ClaimCODE.claimTokens(correctNumTokens, correctProof))
      .to.emit(ClaimCODE, 'Claim')
      .withArgs(correctFormattedAddress, ethers.utils.parseUnits((100).toString(), TOKEN_DECIMALS));

    // Get tokens for address incorrectly using user[2]
    /* const otherFormattedAddress: string = ethers.utils.getAddress(users[2].address);
    const wrongNumTokens: string = ethers.utils.parseUnits('123', TOKEN_DECIMALS).toString();
    const wrongLeaf: Buffer = generateLeaf(otherFormattedAddress, wrongNumTokens);
    const wrongProof: string[] = merkleTree.getHexProof(wrongLeaf);
    await expect(users[2].CODEToken.claimTokens(wrongNumTokens, wrongProof)).to.be.revertedWith(
      'CODE: Valid proof required.'
    ); */
  });
});

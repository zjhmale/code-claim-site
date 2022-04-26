import { expect } from './chai-setup';
import { ethers, deployments, getNamedAccounts } from 'hardhat';
import { CODE } from '../../next-app/src/typechain';

const TOKEN_DECIMALS = 18;

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['CODE']);

  const CODE = <CODE>await ethers.getContract('CODE');

  return {
    CODE,
  };
});

describe('CODE', function () {
  it('Only mint role can mint new token', async function () {
    const { CODE } = await setup();
    const { treasury } = await getNamedAccounts();

    const tc = await CODE.connect(await ethers.getSigner(treasury));
    const mintRole = await CODE.MINTER_ROLE();
    await expect(tc.mint(treasury, ethers.utils.parseUnits((100_000).toString(), TOKEN_DECIMALS))).to.be.revertedWith(
      `AccessControl: account ${treasury.toLowerCase()} is missing role ${mintRole}`
    );

    const treasuryBalExp = 6_500_000 - 690_000 / 2; // trasnfered from treasury to vesting

    const treasuryBalance = await CODE.balanceOf(treasury);
    expect(treasuryBalance).to.equal(ethers.utils.parseUnits(treasuryBalExp.toString(), TOKEN_DECIMALS));

    await CODE.grantRole(mintRole, treasury);

    await tc.mint(treasury, ethers.utils.parseUnits((100_000).toString(), TOKEN_DECIMALS));

    const treasuryBalanceAfter = await CODE.balanceOf(treasury);
    expect(treasuryBalanceAfter).to.equal(
      ethers.utils.parseUnits((treasuryBalExp + 100_000).toString(), TOKEN_DECIMALS)
    );

    await CODE.revokeRole(mintRole, treasury);

    await expect(tc.mint(treasury, ethers.utils.parseUnits((100_000).toString(), TOKEN_DECIMALS))).to.be.revertedWith(
      `AccessControl: account ${treasury.toLowerCase()} is missing role ${mintRole}`
    );
  });
});

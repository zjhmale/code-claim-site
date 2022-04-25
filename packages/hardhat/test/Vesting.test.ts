import { expect } from './chai-setup';
import { ethers, deployments, getUnnamedAccounts, getNamedAccounts } from 'hardhat';
import { Vesting, CODE } from '../../next-app/src/typechain';
import { setupUsers } from './utils';

const TOKEN_DECIMALS = 18;

const setup = deployments.createFixture(async () => {
  await deployments.fixture(['Vesting']);

  const unnamedAccounts = await getUnnamedAccounts();

  const payees = [unnamedAccounts[1], unnamedAccounts[2], unnamedAccounts[3]];
  // shares should sum up to 690_000
  const shares = [
    ethers.utils.parseUnits((300_000).toString(), TOKEN_DECIMALS),
    ethers.utils.parseUnits((300_000).toString(), TOKEN_DECIMALS),
    ethers.utils.parseUnits((90_000).toString(), TOKEN_DECIMALS),
  ];

  const CODE = <CODE>await ethers.getContract('CODE');
  const Vesting = <Vesting>await ethers.getContract('Vesting');
  const users = await setupUsers(unnamedAccounts, { Vesting });

  const { treasury } = await getNamedAccounts();
  const treasuryOwnedVesting = await Vesting.connect(await ethers.getSigner(treasury));

  await treasuryOwnedVesting.addPayees(payees, shares);

  return {
    CODE,
    Vesting,
    treasuryOwnedVesting,
    users,
  };
});

describe('Vesting', function () {
  it('Deployment should assign vesting supply of tokens correctly', async function () {
    const { CODE, Vesting } = await setup();
    const vestingBalance = await CODE.balanceOf(Vesting.address);
    expect(vestingBalance).to.equal(ethers.utils.parseUnits((690_000).toString(), TOKEN_DECIMALS));
  });

  it('Deployment should assign treasury as the owner of vesting contract', async function () {
    const { Vesting } = await setup();
    const { treasury } = await getNamedAccounts();
    const owner = await Vesting.owner();
    expect(treasury).to.equal(owner);
  });

  it('no releasable assets at exactly the same time after vesting contract deployed', async function () {
    const { Vesting } = await setup();
    expect(await Vesting.epoch(0)).to.equal(0);
  });

  it('no releasable assets within the first 30 days', async function () {
    const { users } = await setup();
    const tenDayAfter = 10 * 24 * 60 * 60;
    await ethers.provider.send('evm_increaseTime', [tenDayAfter]);
    // vesting tokens will only be released every month
    await expect(users[1].Vesting.release()).to.be.revertedWith('Vesting: account is not due payment');
  });

  it('non payee got no vesting', async function () {
    const { users } = await setup();
    await expect(users[0].Vesting.release()).to.be.revertedWith('Vesting: account has no shares');
  });

  it('release part of shares if vesting duration not ends', async function () {
    const { CODE, users } = await setup();

    const twoMonthAfter = 2 * 30 * 24 * 60 * 60;
    await ethers.provider.send('evm_increaseTime', [twoMonthAfter]);

    await users[1].Vesting.release();
    expect(await CODE.balanceOf(users[1].address)).to.equal(
      ethers.utils.parseUnits(((300_000 * 2) / 24).toString(), TOKEN_DECIMALS)
    );

    expect(await users[1].Vesting.released(users[1].address)).to.equal(
      ethers.utils.parseUnits(((300_000 * 2) / 24).toString(), TOKEN_DECIMALS)
    );

    const anotherEightMonthAndTenDayAfter = 8 * 30 * 24 * 60 * 60 + 10 * 24 * 60 * 60;
    await ethers.provider.send('evm_increaseTime', [anotherEightMonthAndTenDayAfter]);

    await users[1].Vesting.release();
    expect(await CODE.balanceOf(users[1].address)).to.equal(
      ethers.utils.parseUnits(((300_000 * 10) / 24).toString(), TOKEN_DECIMALS)
    );
    expect(await users[1].Vesting.released(users[1].address)).to.equal(
      ethers.utils.parseUnits(((300_000 * 10) / 24).toString(), TOKEN_DECIMALS)
    );
  });

  it('release all shares if vesting duration ends', async function () {
    const { CODE, users } = await setup();

    const oneYearsAfter = 365 * 24 * 60 * 60;
    await ethers.provider.send('evm_increaseTime', [oneYearsAfter]);

    await users[1].Vesting.release();
    expect(await CODE.balanceOf(users[1].address)).to.equal(
      ethers.utils.parseUnits((150_000).toString(), TOKEN_DECIMALS)
    );
    expect(await users[1].Vesting.released(users[1].address)).to.equal(
      ethers.utils.parseUnits((150_000).toString(), TOKEN_DECIMALS)
    );

    const anotherYearsAfter = 365 * 24 * 60 * 60 + 10 * 24 * 60 * 60;
    await ethers.provider.send('evm_increaseTime', [anotherYearsAfter]);

    await users[1].Vesting.release();
    expect(await CODE.balanceOf(users[1].address)).to.equal(
      ethers.utils.parseUnits((300_000).toString(), TOKEN_DECIMALS)
    );
    expect(await users[1].Vesting.released(users[1].address)).to.equal(
      ethers.utils.parseUnits((300_000).toString(), TOKEN_DECIMALS)
    );
  });

  it('cannot sweep if claim period not ends', async function () {
    const { CODE, Vesting, treasuryOwnedVesting } = await setup();

    await expect(Vesting.sweep()).to.be.revertedWith('Ownable: caller is not the owner');

    await expect(treasuryOwnedVesting.sweep()).to.be.revertedWith('Vesting: Release period not ends');

    const twoYearsAfter = 2 * 365 * 24 * 60 * 60 + 10 * 24 * 60 * 60;
    await ethers.provider.send('evm_increaseTime', [twoYearsAfter]);

    await treasuryOwnedVesting.sweep();

    const { treasury } = await getNamedAccounts();
    const treasuryBalance = await CODE.balanceOf(treasury);
    expect(treasuryBalance).to.equal(ethers.utils.parseUnits((6_500_000).toString(), TOKEN_DECIMALS));
  });
});

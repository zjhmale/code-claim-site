import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer, treasury } = await getNamedAccounts();

  const claimEndDate = new Date();
  const claimEnd = Math.floor(claimEndDate.setDate(new Date().getDate() + 90) / 1000);
  console.log('claimEnd', claimEnd);

  const dd = await deploy('CODEToken', {
    from: deployer,
    log: true,
    // treasuryAddress, treasurySupply, airdropSupply, _claimPeriodEnds (90 days in future)
    args: [treasury, 6_500_000, 3_500_000, claimEnd /* 1651156281 */],
  });

  console.log('dd deployed to:', dd.address);
};

export default main;
main.tags = ['CODEToken'];

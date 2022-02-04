import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const CODE = await deployments.get('CODE');

  const claimEndDate = new Date();
  const claimEnd = Math.floor(claimEndDate.setDate(new Date().getDate() + 90) / 1000);
  console.log('claimEnd', claimEnd);

  console.log('CODE.address', CODE.address);

  const claimCODE = await deploy('ClaimCODE', {
    from: deployer,
    log: true,
    // uint256 _claimPeriodEnds, address _codeToken
    args: [claimEnd, CODE.address],
  });
  console.log('ClaimCODE deployed to:', claimCODE.address);
};

export default main;
main.tags = ['ClaimCODE'];
main.dependencies = ['CODE'];

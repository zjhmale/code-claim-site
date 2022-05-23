import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer, treasury } = await getNamedAccounts();

  const dd = await deploy('CODE', {
    from: deployer,
    log: true,
    args: [treasury],
  });

  const codeContract = await ethers.getContract('CODE');
  const adminRole = await codeContract.DEFAULT_ADMIN_ROLE();
  const connectContract = await codeContract.connect(await ethers.getSigner(deployer));
  // transfer DEFAULT_ADMIN_ROLE from deployer to treasury
  await connectContract.grantRole(adminRole, treasury);
  await connectContract.revokeRole(adminRole, deployer);

  console.log('CODE contract deployer:', deployer);
  console.log('CODE contract deployed to:', dd.address);
};

export default main;
main.tags = ['CODE'];

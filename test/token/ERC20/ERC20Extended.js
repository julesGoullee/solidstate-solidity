const describeBehaviorOfERC20Extended = require('@solidstate/spec/token/ERC20/ERC20Extended.behavior.js');

let deploy = async function () {
  let factory = await ethers.getContractFactory('ERC20ExtendedMock');
  let instance = await factory.deploy();
  return await instance.deployed();
};

describe('ERC20Extended', function () {
  let instance;

  beforeEach(async function () {
    instance = await deploy();
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describeBehaviorOfERC20Extended({
    deploy: () => instance,
    supply: ethers.constants.Zero,
    mint: (recipient, amount) => instance.mint(recipient, amount),
    burn: (recipient, amount) => instance.burn(recipient, amount),
  }, []);
});

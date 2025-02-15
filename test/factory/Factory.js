const { expect } = require('chai');

const describeBehaviorOfFactory = require('@solidstate/spec/factory/Factory.behavior.js');

let deploy = async function () {
  let factory = await ethers.getContractFactory('FactoryMock');
  let instance = await factory.deploy();
  return await instance.deployed();
};

describe('Factory', function () {
  let instance;

  beforeEach(async function () {
    instance = await deploy();
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describeBehaviorOfFactory({});

  describe('__internal', function () {
    describe('#_deploy', function () {
      describe('(bytes)', function () {
        it('deploys bytecode and returns deployment address', async function () {
          let initCode = instance.deployTransaction.data;

          let address = await instance.callStatic['deploy(bytes)'](initCode);
          expect(address).to.be.properAddress;

          // await instance['deploy(bytes)'](initCode);
          // let deployed = await ethers.getContractAt('Factory', address);
          // TODO: assert code at address is correct
        });
      });

      describe('(bytes,bytes32)', function () {
        it('deploys bytecode and returns deployment address', async function () {
          let initCode = await instance.deployTransaction.data;
          let initCodeHash = ethers.utils.keccak256(initCode);
          let salt = ethers.utils.randomBytes(32);

          let address = await instance.callStatic['deploy(bytes,bytes32)'](initCode, salt);
          expect(address).to.equal(await instance.calculateDeploymentAddress(initCodeHash, salt));

          // await instance['deploy(bytes)'](initCode);
          // let deployed = await ethers.getContractAt('Factory', address);
          // TODO: assert code at address is correct
        });

        describe('reverts if', function () {
          it('salt has already been used', async function () {
            let initCode = instance.deployTransaction.data;
            let salt = ethers.utils.randomBytes(32);

            await instance['deploy(bytes,bytes32)'](initCode, salt);

            await expect(
              instance['deploy(bytes,bytes32)'](initCode, salt)
            ).to.be.revertedWith(
              'Factory: failed deployment'
            );
          });
        });
      });
    });

    describe('#_calculateDeploymentAddress', function () {
      it('returns address of not-yet-deployed contract', async function () {
        let initCode = instance.deployTransaction.data;
        let initCodeHash = ethers.utils.keccak256(initCode);
        let salt = ethers.utils.randomBytes(32);

        expect(
          await instance.callStatic.calculateDeploymentAddress(initCodeHash, salt)
        ).to.equal(
          ethers.utils.getCreate2Address(instance.address, salt, initCodeHash)
        );
      });
    });
  });
});

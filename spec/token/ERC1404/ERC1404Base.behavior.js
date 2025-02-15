const { expect } = require('chai');

const describeBehaviorOfERC20Base = require('../ERC20/ERC20Base.behavior.js');

const { describeFilter } = require('@solidstate/library/mocha_describe_filter.js');

const describeBehaviorOfERC1404Base = function ({ deploy, restrictions, mint, burn, supply }, skips) {
  const describe = describeFilter(skips);

  describe('::ERC1404Base', function () {
    let instance;

    beforeEach(async function () {
      instance = await ethers.getContractAt('ERC1404Base', (await deploy()).address);
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    describeBehaviorOfERC20Base({
      deploy: () => instance, supply,
      mint,
      burn,
    }, skips);

    // TODO: transfers blocked if restriction exists

    describe('#detectTransferRestriction', function () {
      it('returns zero if no restriction exists', async function () {
        expect(
          await instance.callStatic['detectTransferRestriction(address,address,uint256)'](
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            ethers.constants.One
          )
        ).to.equal(0);
      });
    });

    describe('#messageForTransferRestriction', function () {
      it('returns empty string for unknown restriction code', async function () {
        expect(
          await instance.callStatic['messageForTransferRestriction(uint8)'](255)
        ).to.equal('');
      });

      for (let restriction of restrictions) {
        it(`returns "${ restriction.message }" for code ${ restriction.code }`, async function () {
          expect(
            await instance.callStatic['messageForTransferRestriction(uint8)'](restriction.code)
          ).to.equal(restriction.message);
        });
      }
    });
  });
};

// eslint-disable-next-line mocha/no-exports
module.exports = describeBehaviorOfERC1404Base;

const { expect } = require('chai');

const { describeFilter } = require('@solidstate/library/mocha_describe_filter.js');

const describeBehaviorOfERC20Base = function ({ deploy, supply, mint, burn }, skips) {
  const describe = describeFilter(skips);

  describe('::ERC20Base', function () {
    // note: holder gets supply (1e18) amount of tokens so use spender/receiver for easier testing
    let holder, spender, receiver, sender;
    let instance;

    before(async function () {
      [holder, spender, receiver, sender] = await ethers.getSigners();
    });

    beforeEach(async function () {
      instance = await ethers.getContractAt('ERC20Base', (await deploy()).address);
    });

    describe('#totalSupply', function () {
      it('returns the total supply of tokens', async function () {
        expect(
          await instance.callStatic['totalSupply()']()
        ).to.equal(supply);

        const amount = ethers.constants.Two;

        await mint(holder.address, amount);

        expect(
          await instance.callStatic['totalSupply()']()
        ).to.equal(supply.add(amount));

        await burn(holder.address, amount);

        expect(
          await instance.callStatic['totalSupply()']()
        ).to.equal(supply);
      });
    });

    describe('#balanceOf', function () {
      it('returns the token balance of given address', async function () {
        expect(
          await instance.callStatic['balanceOf(address)'](ethers.constants.AddressZero)
        ).to.equal(ethers.constants.Zero);

        const amount = ethers.constants.Two;

        await expect(
          () => mint(holder.address, amount)
        ).to.changeTokenBalance(instance, holder, amount);

        await expect(
          () => burn(holder.address, amount)
        ).to.changeTokenBalance(instance, holder, -amount);
      });
    });

    describe('#allowance', function () {
      it('returns the allowance given holder has granted to given spender', async function () {
        expect(
          await instance.callStatic['allowance(address,address)'](holder.address, spender.address)
        ).to.equal(ethers.constants.Zero);

        let amount = ethers.constants.Two;
        await instance.connect(holder)['approve(address,uint256)'](spender.address, amount);

        expect(
          await instance.callStatic['allowance(address,address)'](holder.address, spender.address)
        ).to.equal(amount);
      });
    });

    describe('#transfer', function () {
      it('transfers amount from a to b', async function(){
        const amount = ethers.constants.Two;
        await mint(spender.address, amount);

        await expect(
          () => instance.connect(spender).transfer(holder.address, amount)
        ).to.changeTokenBalances(instance, [spender, holder], [-amount, amount]);
      });

      describe('reverts if', function (){
        it('has insufficient balance', async function(){
          const amount = ethers.constants.Two;

          await expect(instance.connect(spender).transfer(holder.address, amount)).to.be.reverted;
        });
      });
    });

    describe('#transferFrom', function () {
      it('transfers amount from spender on behalf of sender', async function(){
        const amount = ethers.constants.Two;
        await mint(sender.address, amount);

        await instance.connect(sender).approve(spender.address, amount);

        await expect(
          () => instance.connect(spender).transferFrom(sender.address, receiver.address, amount)
        ).to.changeTokenBalances(instance, [sender, receiver], [-amount, amount]);
      });

      describe('reverts if', function (){
        it('has insufficient balance', async function(){
          const amount = ethers.constants.Two;

          await expect(instance.connect(spender).transfer(holder.address, amount)).to.be.reverted;
        });

        it('spender not approved', async function(){
          const amount = ethers.constants.Two;
          await mint(sender.address, amount);

          await expect(instance.connect(spender).transferFrom(sender.address, receiver.address, amount)).to.be.reverted;
        });
      });
    });

    describe('#approve', function () {
      it('enables given spender to spend tokens on behalf of sender', async function () {
        let amount = ethers.constants.Two;
        await instance.connect(holder)['approve(address,uint256)'](spender.address, amount);

        expect(
          await instance.callStatic['allowance(address,address)'](holder.address, spender.address)
        ).to.equal(amount);

        // TODO: test case is no different from #allowance test; tested further by #transferFrom tests
      });

      it('emits Approval event', async function () {
        let amount = ethers.constants.Two;

        await expect(
          instance.connect(holder)['approve(address,uint256)'](spender.address, amount)
        ).to.emit(
          instance, 'Approval'
        ).withArgs(
          holder.address, spender.address, amount
        );
      });
    });
  });
};

// eslint-disable-next-line mocha/no-exports
module.exports = describeBehaviorOfERC20Base;

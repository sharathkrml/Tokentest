const { expect } = require("chai");

describe("MyToken", () => {
  let MyTokenContract;
  let owner;
  let spender;
  let accounts;
  beforeEach(async () => {
    const MyTokenFactory = await ethers.getContractFactory("MyToken");
    MyTokenContract = await MyTokenFactory.deploy();
    await MyTokenContract.deployed();
    [owner, spender, ...accounts] = await ethers.getSigners();
  });
  describe("Checks basic deployment features", async () => {
    it("Checks name", async () => {
      expect(await MyTokenContract.name()).to.equal("MyToken");
    });
    it("Checks symbol", async () => {
      expect(await MyTokenContract.symbol()).to.equal("MTK");
    });
    it("Checks decimals", async () => {
      expect(await MyTokenContract.decimals()).to.equal(18);
    });
    it("Checks totalSupply", async () => {
      expect(await MyTokenContract.totalSupply()).to.equal(
        ethers.utils.parseEther("10")
      );
    });
    it("Checks balanceOf owner", async () => {
      expect(await MyTokenContract.balanceOf(owner.address)).to.equal(
        ethers.utils.parseEther("10")
      );
    });
  });

  describe("transfer", async () => {
    it("transfer amount to another user", async () => {
      x = ethers.utils.parseEther("1");
      await MyTokenContract.transfer(accounts[0].address, x);
      expect(await MyTokenContract.balanceOf(accounts[0].address)).to.equal(x);
      expect(await MyTokenContract.balanceOf(owner.address)).to.equal(
        ethers.utils.parseEther("9")
      );
    });
    it("emits Transfer event", async () => {
      expect(
        await MyTokenContract.transfer(
          accounts[0].address,
          ethers.utils.parseEther("1")
        )
      )
        .to.emit(MyTokenContract, "Transfer")
        .withArgs(
          owner.address,
          accounts[0].address,
          ethers.utils.parseEther("1")
        );
    });
  });
  describe("approve", async () => {
    it("approve spender to use 3 ethers from owner", async () => {
      // allowance first==0
      expect(
        await MyTokenContract.allowance(owner.address, spender.address)
      ).to.equal("0");

      // approves 3 ether for spender to spend
      await MyTokenContract.approve(
        spender.address,
        ethers.utils.parseEther("3")
      );
      expect(
        await MyTokenContract.allowance(owner.address, spender.address)
      ).to.equal(ethers.utils.parseEther("3"));
    });
    it("emits Approval event", async () => {
      expect(
        await MyTokenContract.approve(
          spender.address,
          ethers.utils.parseEther("3")
        )
      )
        .to.emit(MyTokenContract, "Approval")
        .withArgs(owner.address, spender.address, ethers.utils.parseEther("3"));
    });
    it("increase and decrease allowance", async () => {
      // allowance first==0
      expect(
        await MyTokenContract.allowance(owner.address, spender.address)
      ).to.equal("0");
      // increase allowance by 2 ether
      let txn = await MyTokenContract.increaseAllowance(
        spender.address,
        ethers.utils.parseEther("2")
      );
      console.log(await txn.wait());
      // allowance now==2
      // console.log(
      //   await MyTokenContract.allowance(owner.address, spender.address)
      // );
      expect(
        await MyTokenContract.allowance(owner.address, spender.address)
      ).to.equal(ethers.utils.parseEther("2"));
      // decrease allowance by 1 ether
      await MyTokenContract.decreaseAllowance(
        spender.address,
        ethers.utils.parseEther("1")
      );
      // allowance now==2
      // console.log(
      //   await MyTokenContract.allowance(owner.address, spender.address)
      // );
      expect(
        await MyTokenContract.allowance(owner.address, spender.address)
      ).to.equal(ethers.utils.parseEther("1"));
    });
  });
  describe("transferFrom", async () => {
    it("transfer from owner to accounts[0] by spender", async () => {
      // Approve 3 ethers to spender
      await MyTokenContract.approve(
        spender.address,
        ethers.utils.parseEther("3")
      );
      // allowance now == 3
      expect(
        await MyTokenContract.allowance(owner.address, spender.address)
      ).to.equal(ethers.utils.parseEther("3"));

      console.log(
        await MyTokenContract.allowance(owner.address, spender.address)
      );
      await MyTokenContract.connect(spender).transferFrom(
        owner.address,
        accounts[0].address,
        ethers.utils.parseEther("2")
      );
      expect(await MyTokenContract.balanceOf(accounts[0].address)).to.equal(
        ethers.utils.parseEther("2")
      );
      console.log(
        "after txn",
        await MyTokenContract.allowance(owner.address, spender.address)
      );
    });
  });
});

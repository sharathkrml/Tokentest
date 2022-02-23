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
});

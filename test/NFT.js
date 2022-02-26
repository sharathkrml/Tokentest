const { expect } = require("chai");

describe("MyNFT", () => {
  let NFTContract;
  let owner;
  let spender;
  let accounts;
  beforeEach(async () => {
    const NFTContractFactory = await ethers.getContractFactory("MyNFT");
    NFTContract = await NFTContractFactory.deploy(
      "https://nft-collection-sneh1999.vercel.app/api/"
    );
    await NFTContract.deployed();
    [owner, spender, ...accounts] = await ethers.getSigners();
  });
  describe("Check basic functions", async () => {
    it("Check name", async () => {
      expect(await NFTContract.name()).to.equal("MyNFT");
    });
    it("Check symbol", async () => {
      expect(await NFTContract.symbol()).to.equal("MFT");
    });
    it("Checks price ", async () => {
      expect(await NFTContract._price()).to.equal(
        ethers.utils.parseEther("0.01")
      );
    });
    it("Checks Owner", async () => {
      expect(await NFTContract.owner()).to.equal(owner.address);
    });
  });
  describe("Minting", async () => {
    it("Owner mints and balanceOf changes & Check ownerOf", async () => {
      // console.log(await owner.getBalance());
      expect(
        await NFTContract.mint({
          value: ethers.utils.parseEther("0.01"),
        })
      )
        .to.emit(NFTContract, "Transfer")
        .withArgs(ethers.constants.AddressZero, owner.address, 1);
      // Transfer(address from,address to, tokenId)
      expect(await NFTContract.balanceOf(owner.address)).to.equal("1");

      expect(
        await NFTContract.connect(accounts[0]).mint({
          value: ethers.utils.parseEther("0.01"),
        })
      )
        .to.emit(NFTContract, "Transfer")
        .withArgs(ethers.constants.AddressZero, accounts[0].address, 2);
      // Transfer(address from,address to, tokenId)
      expect(await NFTContract.balanceOf(accounts[0].address)).to.equal("1");

      expect(
        await NFTContract.mint({
          value: ethers.utils.parseEther("0.01"),
        })
      )
        .to.emit(NFTContract, "Transfer")
        .withArgs(ethers.constants.AddressZero, owner.address, 3);
      // Transfer(address from,address to, tokenId)
      expect(await NFTContract.balanceOf(owner.address)).to.equal(2);
      expect(await NFTContract.balanceOf(accounts[0].address)).to.equal(1);

      expect(await NFTContract.ownerOf(1)).to.equal(owner.address);
      expect(await NFTContract.ownerOf(3)).to.equal(owner.address);
      expect(await NFTContract.ownerOf(2)).to.equal(accounts[0].address);
    });
  });
  describe("safeTransferFrom", async () => {
    // safeTransferFrom(address from, address to, uint256 tokenId)
    // If caller != from,Caller must be approved
    beforeEach(async () => {
      // Mint some tokens
      for (let i = 0; i < 5; i++) {
        await NFTContract.mint({
          value: ethers.utils.parseEther("0.01"),
        });
      }
    });
    it("owner calls safeTransferFrom", async () => {
      expect(await NFTContract.ownerOf(1)).to.equal(owner.address);
      expect(await NFTContract.balanceOf(owner.address)).to.equal(5);
      expect(await NFTContract.balanceOf(accounts[0].address)).to.equal(0);

      expect(
        await NFTContract["safeTransferFrom(address,address,uint256)"](
          owner.address,
          accounts[0].address,
          1
        )
      )
        .to.emit(NFTContract, "Transfer")
        .withArgs(owner.address, accounts[0].address, 1);

      expect(await NFTContract.ownerOf(1)).to.equal(accounts[0].address);
      expect(await NFTContract.balanceOf(owner.address)).to.equal(4);
      expect(await NFTContract.balanceOf(accounts[0].address)).to.equal(1);

      // get URI of minted token
      // console.log(await NFTContract.tokenURI(1));
    });
    it("spender approved by owner, calls safeTransferFrom", async () => {
      expect(await NFTContract.approve(spender.address, 1))
        .to.emit(NFTContract, "Approval")
        .withArgs(owner.address, spender.address, 1);
      expect(await NFTContract.getApproved(1)).to.equal(spender.address);
      // Spender calls safeTransferFrom
      await NFTContract.connect(spender)[
        "safeTransferFrom(address,address,uint256)"
      ](owner.address, accounts[0].address, 1);
      expect(await NFTContract.ownerOf(1)).to.equal(accounts[0].address);
      // Clears approval
      expect(await NFTContract.getApproved(1)).to.equal(
        ethers.constants.AddressZero
      );
    });
    describe("setApproveForAll", async () => {
      // Approve all tokens
      beforeEach(async () => {
        await NFTContract.setApprovalForAll(spender.address, true);
      });
      it("checks approval", async () => {
        expect(
          await NFTContract.isApprovedForAll(owner.address, spender.address)
        ).to.equal(true);
      });
      it("safeTransferFrom", async () => {
        expect(await NFTContract.ownerOf(1)).to.equal(owner.address);
        expect(
          await NFTContract.connect(spender)[
            "safeTransferFrom(address,address,uint256)"
          ](owner.address, accounts[0].address, 1)
        )
          .to.emit(NFTContract, "Transfer")
          .withArgs(owner.address, accounts[0].address, 1);
        expect(await NFTContract.ownerOf(1)).to.equal(accounts[0].address);
      });
    });

    describe("check transferFrom and safeTransferFrom", async () => {
      let NormalAddress;
      beforeEach(async () => {
        const Factory = await ethers.getContractFactory("Normal");
        let NormalContract = await Factory.deploy();
        await NormalContract.deployed();
        NormalAddress = NormalContract.address;
      });
      it("send NFT to tokenaddress using transferFrom will succeed", async () => {
        expect(await NFTContract.transferFrom(owner.address, NormalAddress, 1))
          .to.emit(NFTContract, "Transfer")
          .withArgs(owner.address, NormalAddress, 1);
      });
      it("cannot sent NFT to tokenaddress using safeTransferFrom", async () => {
        await expect(
          NFTContract["safeTransferFrom(address,address,uint256)"](
            owner.address,
            NormalAddress,
            1
          )
        ).to.be.revertedWith(
          "ERC721: transfer to non ERC721Receiver implementer"
        );
      });
    });
  });
});

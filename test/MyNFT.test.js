const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
  let myNFT;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const NFT_NAME = "MyNFT";
  const NFT_SYMBOL = "MNFT";
  const BASE_URI = "https://example.com/metadata/";
  const MINT_PRICE = ethers.parseEther("0.01");

  beforeEach(async function () {
    // 获取测试账户
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // 部署合约
    const MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy(NFT_NAME, NFT_SYMBOL, BASE_URI, MINT_PRICE);
    await myNFT.waitForDeployment();
  });

  describe("部署", function () {
    it("应该正确设置合约名称和符号", async function () {
      expect(await myNFT.name()).to.equal(NFT_NAME);
      expect(await myNFT.symbol()).to.equal(NFT_SYMBOL);
    });

    it("应该正确设置owner", async function () {
      expect(await myNFT.owner()).to.equal(owner.address);
    });

    it("应该正确设置初始铸造价格", async function () {
      expect(await myNFT.mintPrice()).to.equal(MINT_PRICE);
    });

    it("应该正确设置最大供应量和每钱包限制", async function () {
      expect(await myNFT.MAX_SUPPLY()).to.equal(100);
      expect(await myNFT.MAX_PER_WALLET()).to.equal(5);
    });

    it("初始总供应量应该为0", async function () {
      expect(await myNFT.totalSupply()).to.equal(0);
    });
  });

  describe("铸造功能", function () {
    it("应该能成功铸造1个NFT并发出Minted事件", async function () {
      await expect(
        myNFT.connect(addr1).mint(1, { value: MINT_PRICE })
      )
        .to.emit(myNFT, "Minted")
        .withArgs(addr1.address, 1, 1);

      expect(await myNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await myNFT.totalSupply()).to.equal(1);
      expect(await myNFT.mintedPerWallet(addr1.address)).to.equal(1);
    });

    it("应该能成功铸造多个NFT", async function () {
      const quantity = 3;
      const totalPrice = MINT_PRICE * BigInt(quantity);

      await expect(
        myNFT.connect(addr1).mint(quantity, { value: totalPrice })
      )
        .to.emit(myNFT, "Minted")
        .withArgs(addr1.address, 1, quantity);

      expect(await myNFT.totalSupply()).to.equal(quantity);
      expect(await myNFT.mintedPerWallet(addr1.address)).to.equal(quantity);
      expect(await myNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await myNFT.ownerOf(2)).to.equal(addr1.address);
      expect(await myNFT.ownerOf(3)).to.equal(addr1.address);
    });

    it("支付金额不足时应该失败", async function () {
      const insufficientPayment = ethers.parseEther("0.005");
      await expect(
        myNFT.connect(addr1).mint(1, { value: insufficientPayment })
      ).to.be.revertedWithCustomError(myNFT, "InsufficientPayment");
    });

    it("铸造数量为0时应该失败", async function () {
      await expect(
        myNFT.connect(addr1).mint(0, { value: 0 })
      ).to.be.revertedWithCustomError(myNFT, "InvalidQuantity");
    });

    it("超过每钱包限制时应该失败", async function () {
      // 先铸造5个（最大限制）
      await myNFT.connect(addr1).mint(5, { value: MINT_PRICE * BigInt(5) });

      // 尝试再铸造1个，应该失败
      await expect(
        myNFT.connect(addr1).mint(1, { value: MINT_PRICE })
      ).to.be.revertedWithCustomError(myNFT, "ExceedsMaxPerWallet");
    });

    it("超过最大供应量时应该失败", async function () {
      // 使用多个账户铸造接近最大供应量
      const accounts = await ethers.getSigners();
      
      // 铸造99个NFT（每个账户5个，需要20个账户）
      for (let i = 0; i < 20; i++) {
        const account = accounts[i];
        const quantity = i === 19 ? 4 : 5; // 最后一个账户只铸造4个
        await myNFT.connect(account).mint(quantity, {
          value: MINT_PRICE * BigInt(quantity),
        });
      }

      expect(await myNFT.totalSupply()).to.equal(99);

      // 尝试铸造2个，应该失败（只剩1个位置）
      await expect(
        myNFT.connect(addr2).mint(2, { value: MINT_PRICE * BigInt(2) })
      ).to.be.revertedWithCustomError(myNFT, "ExceedsMaxSupply");
    });

    it("应该能正确退还多余的ETH", async function () {
      const overpayment = ethers.parseEther("0.05"); // 支付0.05 ETH，但只需要0.01 ETH
      const balanceBefore = await ethers.provider.getBalance(addr1.address);

      const tx = await myNFT.connect(addr1).mint(1, { value: overpayment });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(addr1.address);
      const expectedBalance = balanceBefore - MINT_PRICE - gasUsed;

      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.0001"));
    });
  });

  describe("Owner功能", function () {
    it("Owner应该能修改铸造价格并发出MintPriceUpdated事件", async function () {
      const newPrice = ethers.parseEther("0.02");

      await expect(myNFT.connect(owner).setMintPrice(newPrice))
        .to.emit(myNFT, "MintPriceUpdated")
        .withArgs(newPrice);

      expect(await myNFT.mintPrice()).to.equal(newPrice);
    });

    it("Owner应该能修改baseURI并发出BaseURIUpdated事件", async function () {
      const newBaseURI = "ipfs://QmNewHash/";

      await expect(myNFT.connect(owner).setBaseURI(newBaseURI))
        .to.emit(myNFT, "BaseURIUpdated")
        .withArgs(newBaseURI);

      // 铸造一个NFT来验证新的URI
      await myNFT.connect(addr1).mint(1, { value: MINT_PRICE });
      const tokenURI = await myNFT.tokenURI(1);
      expect(tokenURI).to.equal(newBaseURI + "1.json");
    });

    it("Owner应该能提取合约余额并发出Withdrawn事件", async function () {
      // 先让用户铸造一些NFT，给合约充值
      await myNFT.connect(addr1).mint(3, { value: MINT_PRICE * BigInt(3) });
      const contractBalance = await ethers.provider.getBalance(
        await myNFT.getAddress()
      );

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      await expect(myNFT.connect(owner).withdraw())
        .to.emit(myNFT, "Withdrawn")
        .withArgs(owner.address, contractBalance);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);

      const contractBalanceAfter = await ethers.provider.getBalance(
        await myNFT.getAddress()
      );
      expect(contractBalanceAfter).to.equal(0);
    });
  });

  describe("权限控制", function () {
    it("非Owner不能修改铸造价格", async function () {
      const newPrice = ethers.parseEther("0.02");
      await expect(
        myNFT.connect(addr1).setMintPrice(newPrice)
      ).to.be.revertedWithCustomError(myNFT, "OwnableUnauthorizedAccount");
    });

    it("非Owner不能修改baseURI", async function () {
      const newBaseURI = "ipfs://QmNewHash/";
      await expect(
        myNFT.connect(addr1).setBaseURI(newBaseURI)
      ).to.be.revertedWithCustomError(myNFT, "OwnableUnauthorizedAccount");
    });

    it("非Owner不能提取资金", async function () {
      await expect(
        myNFT.connect(addr1).withdraw()
      ).to.be.revertedWithCustomError(myNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("TokenURI", function () {
    it("应该返回正确的tokenURI", async function () {
      await myNFT.connect(addr1).mint(1, { value: MINT_PRICE });
      const tokenURI = await myNFT.tokenURI(1);
      expect(tokenURI).to.equal(BASE_URI + "1.json");
    });

    it("查询不存在的tokenId应该失败", async function () {
      await expect(
        myNFT.tokenURI(999)
      ).to.be.revertedWithCustomError(myNFT, "ERC721NonexistentToken");
    });
  });

  describe("Ownership Transfer", function () {
    it("应该能转移合约所有权", async function () {
      await myNFT.connect(owner).transferOwnership(addr1.address);
      expect(await myNFT.owner()).to.equal(addr1.address);
    });

    it("新owner应该能执行owner功能", async function () {
      await myNFT.connect(owner).transferOwnership(addr1.address);
      
      const newPrice = ethers.parseEther("0.02");
      await expect(myNFT.connect(addr1).setMintPrice(newPrice))
        .to.emit(myNFT, "MintPriceUpdated")
        .withArgs(newPrice);
    });
  });
});


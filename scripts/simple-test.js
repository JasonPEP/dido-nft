const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("=================================");
  console.log("简单合约交互测试");
  console.log("=================================\n");

  // 获取账户
  const [owner, addr1] = await ethers.getSigners();
  console.log("Owner地址:", owner.address);
  console.log("用户1地址:", addr1.address);

  // 部署新合约
  console.log("\n🚀 部署新合约...");
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy(
    "Test NFT", 
    "TNFT", 
    "https://test.com/", 
    ethers.parseEther("0.01")
  );
  await myNFT.waitForDeployment();
  const contractAddress = await myNFT.getAddress();
  
  console.log("✅ 合约部署成功！");
  console.log("合约地址:", contractAddress);

  // 测试基本功能
  console.log("\n📋 合约基本信息:");
  console.log("合约名称:", await myNFT.name());
  console.log("合约符号:", await myNFT.symbol());
  console.log("最大供应量:", (await myNFT.MAX_SUPPLY()).toString());
  console.log("每钱包限制:", (await myNFT.MAX_PER_WALLET()).toString());
  console.log("铸造价格:", ethers.formatEther(await myNFT.mintPrice()), "ETH");
  console.log("当前总供应量:", (await myNFT.totalSupply()).toString());

  // 测试铸造
  console.log("\n🎨 测试铸造功能...");
  const mintPrice = await myNFT.mintPrice();
  
  console.log("用户1铸造1个NFT...");
  const tx = await myNFT.connect(addr1).mint(1, { value: mintPrice });
  const receipt = await tx.wait();
  
  console.log("✅ 铸造成功！");
  console.log("交易hash:", tx.hash);
  console.log("Gas使用量:", receipt.gasUsed.toString());
  console.log("NFT #1 的Owner:", await myNFT.ownerOf(1));
  console.log("用户1已铸造数量:", (await myNFT.mintedPerWallet(addr1.address)).toString());
  console.log("当前总供应量:", (await myNFT.totalSupply()).toString());

  // 测试TokenURI
  console.log("\n🔗 测试TokenURI...");
  const tokenURI = await myNFT.tokenURI(1);
  console.log("NFT #1 的URI:", tokenURI);

  // 测试Owner功能
  console.log("\n🔧 测试Owner功能...");
  
  console.log("修改铸造价格...");
  const newPrice = ethers.parseEther("0.02");
  await myNFT.connect(owner).setMintPrice(newPrice);
  console.log("新铸造价格:", ethers.formatEther(await myNFT.mintPrice()), "ETH");

  console.log("修改BaseURI...");
  const newBaseURI = "ipfs://QmTest/";
  await myNFT.connect(owner).setBaseURI(newBaseURI);
  console.log("新TokenURI:", await myNFT.tokenURI(1));

  // 查看合约余额
  const contractBalance = await ethers.provider.getBalance(contractAddress);
  console.log("合约余额:", ethers.formatEther(contractBalance), "ETH");

  // 提取资金
  console.log("提取资金...");
  const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
  await myNFT.connect(owner).withdraw();
  const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
  console.log("提取金额:", ethers.formatEther(contractBalance), "ETH");

  console.log("\n=================================");
  console.log("🎉 测试完成！所有功能正常！");
  console.log("=================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  });

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("=================================");
  console.log("开始与合约交互测试...");
  console.log("=================================\n");

  // 获取账户
  const [owner, addr1, addr2] = await ethers.getSigners();
  console.log("Owner地址:", owner.address);
  console.log("用户1地址:", addr1.address);
  console.log("用户2地址:", addr2.address);

  // 连接到已部署的合约
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.attach(contractAddress);
  
  // 验证合约是否正确部署
  try {
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      throw new Error("合约地址没有代码，请检查部署是否成功");
    }
    console.log("✅ 合约代码验证成功");
  } catch (error) {
    console.error("❌ 合约验证失败:", error.message);
    return;
  }

  console.log("\n📋 合约基本信息:");
  console.log("合约地址:", contractAddress);
  console.log("合约名称:", await myNFT.name());
  console.log("合约符号:", await myNFT.symbol());
  console.log("最大供应量:", (await myNFT.MAX_SUPPLY()).toString());
  console.log("每钱包限制:", (await myNFT.MAX_PER_WALLET()).toString());
  console.log("当前铸造价格:", ethers.formatEther(await myNFT.mintPrice()), "ETH");
  console.log("当前总供应量:", (await myNFT.totalSupply()).toString());

  console.log("\n🎨 测试铸造功能...");
  
  // 测试1: 用户1铸造1个NFT
  console.log("\n1. 用户1铸造1个NFT...");
  const mintPrice = await myNFT.mintPrice();
  const tx1 = await myNFT.connect(addr1).mint(1, { value: mintPrice });
  const receipt1 = await tx1.wait();
  
  console.log("✅ 铸造成功！");
  console.log("交易hash:", tx1.hash);
  console.log("Gas使用量:", receipt1.gasUsed.toString());
  
  // 查看铸造结果
  console.log("NFT #1 的Owner:", await myNFT.ownerOf(1));
  console.log("用户1已铸造数量:", (await myNFT.mintedPerWallet(addr1.address)).toString());
  console.log("当前总供应量:", (await myNFT.totalSupply()).toString());

  // 测试2: 用户1再铸造2个NFT
  console.log("\n2. 用户1再铸造2个NFT...");
  const tx2 = await myNFT.connect(addr1).mint(2, { value: mintPrice * BigInt(2) });
  await tx2.wait();
  
  console.log("✅ 批量铸造成功！");
  console.log("用户1已铸造数量:", (await myNFT.mintedPerWallet(addr1.address)).toString());
  console.log("当前总供应量:", (await myNFT.totalSupply()).toString());

  // 测试3: 用户2铸造1个NFT
  console.log("\n3. 用户2铸造1个NFT...");
  const tx3 = await myNFT.connect(addr2).mint(1, { value: mintPrice });
  await tx3.wait();
  
  console.log("✅ 用户2铸造成功！");
  console.log("NFT #4 的Owner:", await myNFT.ownerOf(4));
  console.log("用户2已铸造数量:", (await myNFT.mintedPerWallet(addr2.address)).toString());

  // 测试4: 查看TokenURI
  console.log("\n4. 查看TokenURI...");
  const tokenURI = await myNFT.tokenURI(1);
  console.log("NFT #1 的URI:", tokenURI);

  console.log("\n🔧 测试Owner功能...");
  
  // 测试5: 修改铸造价格
  console.log("\n5. Owner修改铸造价格...");
  const newPrice = ethers.parseEther("0.02");
  const tx5 = await myNFT.connect(owner).setMintPrice(newPrice);
  await tx5.wait();
  
  console.log("✅ 价格修改成功！");
  console.log("新铸造价格:", ethers.formatEther(await myNFT.mintPrice()), "ETH");

  // 测试6: 修改BaseURI
  console.log("\n6. Owner修改BaseURI...");
  const newBaseURI = "ipfs://QmTestHash/";
  const tx6 = await myNFT.connect(owner).setBaseURI(newBaseURI);
  await tx6.wait();
  
  console.log("✅ BaseURI修改成功！");
  console.log("新TokenURI:", await myNFT.tokenURI(1));

  // 测试7: 查看合约余额
  console.log("\n7. 查看合约余额...");
  const contractBalance = await ethers.provider.getBalance(contractAddress);
  console.log("合约余额:", ethers.formatEther(contractBalance), "ETH");

  // 测试8: Owner提取资金
  console.log("\n8. Owner提取资金...");
  const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
  const tx8 = await myNFT.connect(owner).withdraw();
  await tx8.wait();
  const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
  
  console.log("✅ 资金提取成功！");
  console.log("提取金额:", ethers.formatEther(contractBalance), "ETH");
  console.log("Owner余额变化:", ethers.formatEther(ownerBalanceAfter - ownerBalanceBefore), "ETH");

  // 测试9: 查看事件
  console.log("\n📡 查看最近的事件...");
  
  // 获取铸造事件
  const mintFilter = myNFT.filters.Minted();
  const mintEvents = await myNFT.queryFilter(mintFilter);
  
  console.log("铸造事件数量:", mintEvents.length);
  mintEvents.forEach((event, index) => {
    console.log(`事件${index + 1}: ${event.args.minter} 铸造了 ${event.args.quantity} 个NFT，起始tokenId: ${event.args.tokenId}`);
  });

  console.log("\n=================================");
  console.log("🎉 合约交互测试完成！");
  console.log("=================================\n");

  console.log("📊 最终状态:");
  console.log("- 总供应量:", (await myNFT.totalSupply()).toString());
  console.log("- 铸造价格:", ethers.formatEther(await myNFT.mintPrice()), "ETH");
  console.log("- 用户1已铸造:", (await myNFT.mintedPerWallet(addr1.address)).toString());
  console.log("- 用户2已铸造:", (await myNFT.mintedPerWallet(addr2.address)).toString());
  console.log("- 合约余额:", ethers.formatEther(await ethers.provider.getBalance(contractAddress)), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 交互测试失败:", error);
    process.exit(1);
  });

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("=================================");
  console.log("开始部署 MyNFT 合约...");
  console.log("=================================\n");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("账户余额:", ethers.formatEther(balance), "ETH\n");

  // 配置合约参数
  const NFT_NAME = "MyNFT"; // 可以在这里修改NFT系列名称
  const NFT_SYMBOL = "MNFT"; // 可以在这里修改代币符号
  const BASE_URI = "https://example.com/metadata/"; // 初始baseURI，部署后可通过setBaseURI修改
  const MINT_PRICE = ethers.parseEther("0.01"); // 初始铸造价格：0.01 ETH

  console.log("合约配置:");
  console.log("- NFT名称:", NFT_NAME);
  console.log("- NFT符号:", NFT_SYMBOL);
  console.log("- 初始 BaseURI:", BASE_URI);
  console.log("- 初始铸造价格:", ethers.formatEther(MINT_PRICE), "ETH");
  console.log("- 最大供应量: 100");
  console.log("- 每钱包限制: 5\n");

  // 部署合约
  console.log("正在部署合约...");
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy(NFT_NAME, NFT_SYMBOL, BASE_URI, MINT_PRICE);

  await myNFT.waitForDeployment();
  const contractAddress = await myNFT.getAddress();

  console.log("✅ 合约部署成功！");
  console.log("合约地址:", contractAddress);
  console.log("\n=================================");

  // 验证部署
  console.log("\n验证合约部署...");
  const name = await myNFT.name();
  const symbol = await myNFT.symbol();
  const maxSupply = await myNFT.MAX_SUPPLY();
  const maxPerWallet = await myNFT.MAX_PER_WALLET();
  const mintPrice = await myNFT.mintPrice();
  const owner = await myNFT.owner();

  console.log("合约信息:");
  console.log("- 名称:", name);
  console.log("- 符号:", symbol);
  console.log("- 最大供应量:", maxSupply.toString());
  console.log("- 每钱包限制:", maxPerWallet.toString());
  console.log("- 铸造价格:", ethers.formatEther(mintPrice), "ETH");
  console.log("- Owner:", owner);

  console.log("\n=================================");
  console.log("🎉 部署完成！");
  console.log("=================================\n");

  // 在Sepolia网络上提供验证命令
  if (hre.network.name === "sepolia") {
    console.log("📝 在 Etherscan 上验证合约（请等待几分钟后执行）:");
    console.log(
      `npx hardhat verify --network sepolia ${contractAddress} "${NFT_NAME}" "${NFT_SYMBOL}" "${BASE_URI}" "${MINT_PRICE}"`
    );
    console.log("\n📋 在 OpenSea Testnet 查看:");
    console.log(`https://testnets.opensea.io/assets/sepolia/${contractAddress}/1`);
  } else {
    console.log("💡 这是本地部署，合约地址仅在本地网络有效");
  }

  console.log("\n🔧 常用操作:");
  console.log("- 铸造 NFT: 调用 mint(quantity) 函数，支付 mintPrice * quantity ETH");
  console.log("- 修改价格: 调用 setMintPrice(newPrice) [仅Owner]");
  console.log("- 更新 BaseURI: 调用 setBaseURI(newBaseURI) [仅Owner]");
  console.log("- 提取资金: 调用 withdraw() [仅Owner]");
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


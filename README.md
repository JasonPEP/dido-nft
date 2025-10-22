# 🎨 MyNFT - 个人NFT铸造项目

一个功能完整的ERC721 NFT智能合约项目，可直接部署到Ethereum网络并发布到OpenSea。

## ✨ 项目特性

- ✅ **ERC721标准**: 基于OpenZeppelin的安全实现
- 💰 **可配置价格**: Owner可随时调整铸造价格（支持免费铸造）
- 🔢 **供应量限制**: 最大供应100个NFT
- 👤 **钱包限制**: 每个地址最多铸造5个NFT
- 🎯 **批量铸造**: 支持一次铸造多个NFT
- 🔐 **安全保护**: 集成ReentrancyGuard防止重入攻击
- 📡 **事件发射**: 完整的事件系统，便于链下服务索引
- 🌐 **OpenSea兼容**: 符合OpenSea元数据标准

## 🛠️ 技术栈

- **Solidity**: ^0.8.20
- **Hardhat**: 开发和测试框架
- **OpenZeppelin Contracts**: 安全的智能合约库
- **Ethers.js**: 以太坊交互库
- **Chai**: 测试断言库

## 📦 项目结构

```
didotoken/
├── contracts/
│   └── MyNFT.sol              # ERC721 NFT合约
├── scripts/
│   └── deploy.js              # 部署脚本
├── test/
│   └── MyNFT.test.js          # 完整测试套件
├── metadata/
│   ├── example.json           # 元数据示例
│   └── README.md              # 元数据指南
├── package.json               # 项目依赖
├── hardhat.config.js          # Hardhat配置
├── .env.template              # 环境变量模板
├── .gitignore
├── README.md                  # 本文件
└── DEPLOYMENT_GUIDE.md        # 详细部署指南
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.template` 为 `.env` 并填入您的配置：

```bash
cp .env.template .env
```

编辑 `.env` 文件：

```env
PRIVATE_KEY=你的钱包私钥
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ETHERSCAN_API_KEY=你的Etherscan_API_Key
```

**获取RPC URL:**
- [Alchemy](https://www.alchemy.com/) - 注册并创建App
- [Infura](https://infura.io/) - 注册并创建项目
- [QuickNode](https://www.quicknode.com/) - 注册并获取端点

### 3. 编译合约

```bash
npm run compile
```

### 4. 运行测试

```bash
npm test
```

## 📝 合约功能详解

### 核心功能

#### 1. 铸造NFT (`mint`)

```solidity
function mint(uint256 quantity) external payable
```

任何人都可以调用此函数铸造NFT：
- 需要支付 `mintPrice * quantity` 的ETH
- 会检查是否超过最大供应量（100个）
- 会检查是否超过每钱包限制（5个）
- 发出 `Minted` 事件

**示例：**
```javascript
// 铸造1个NFT
await myNFT.mint(1, { value: ethers.parseEther("0.01") });

// 铸造3个NFT
await myNFT.mint(3, { value: ethers.parseEther("0.03") });
```

#### 2. 设置铸造价格 (`setMintPrice`) - 仅Owner

```solidity
function setMintPrice(uint256 newPrice) external onlyOwner
```

Owner可以修改铸造价格：
- 设置为0可实现免费铸造
- 发出 `MintPriceUpdated` 事件

**示例：**
```javascript
// 设置为0.02 ETH
await myNFT.setMintPrice(ethers.parseEther("0.02"));

// 设置为免费
await myNFT.setMintPrice(0);
```

#### 3. 设置BaseURI (`setBaseURI`) - 仅Owner

```solidity
function setBaseURI(string memory newBaseURI) external onlyOwner
```

Owner可以更新元数据的baseURI：
- 可以从临时URL切换到IPFS
- 发出 `BaseURIUpdated` 事件

**示例：**
```javascript
// 设置为IPFS
await myNFT.setBaseURI("ipfs://QmYourHashHere/");

// 设置为HTTP服务器
await myNFT.setBaseURI("https://api.mynft.com/metadata/");
```

#### 4. 提取资金 (`withdraw`) - 仅Owner

```solidity
function withdraw() external onlyOwner
```

Owner可以提取合约中的所有ETH：
- 转账到owner地址
- 发出 `Withdrawn` 事件

**示例：**
```javascript
await myNFT.withdraw();
```

### 事件系统

所有关键操作都会发出事件，便于链下服务监听和索引：

```solidity
// 铸造事件
event Minted(address indexed minter, uint256 indexed tokenId, uint256 quantity);

// 价格更新事件
event MintPriceUpdated(uint256 newPrice);

// BaseURI更新事件
event BaseURIUpdated(string newBaseURI);

// 提取资金事件
event Withdrawn(address indexed receiver, uint256 amount);
```

## 🌐 部署指南

### 本地测试网部署

```bash
# 启动本地Hardhat节点（新终端窗口）
npm run node

# 部署到本地网络（另一个终端窗口）
npm run deploy:local
```

### Sepolia测试网部署

1. 确保您的钱包有Sepolia测试ETH
   - [Alchemy Faucet](https://sepoliafaucet.com/)
   - [Infura Faucet](https://www.infura.io/faucet/sepolia)

2. 运行部署脚本：

```bash
npm run deploy:sepolia
```

3. 在Etherscan上验证合约（等待30秒后执行）：

```bash
npx hardhat verify --network sepolia <合约地址> "MyNFT" "MNFT" "https://example.com/metadata/" "10000000000000000"
```

### 主网部署

⚠️ **重要提醒**：部署到主网前请务必：
1. 完整测试所有功能
2. 准备好最终的元数据和图片
3. 确保私钥安全
4. 确认有足够的ETH支付gas费

修改 `hardhat.config.js` 添加主网配置：

```javascript
mainnet: {
  url: process.env.MAINNET_RPC_URL,
  accounts: [process.env.PRIVATE_KEY],
  chainId: 1,
}
```

然后运行：

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## 🎨 自定义NFT名称

### 修改合约名称和符号

在 `scripts/deploy.js` 中修改：

```javascript
const NFT_NAME = "你的NFT系列名称";  // 例如："Dido Creative Collection"
const NFT_SYMBOL = "你的代币符号";    // 例如："DCC"
```

**常见命名示例：**
- 艺术类：`"Jason's Art Collection"` / `"JAC"`
- 头像类：`"My Avatar NFT"` / `"MANFT"`
- 收藏类：`"Dido Token Collection"` / `"DIDO"`

### 修改每个NFT的名称

在 `metadata/` 文件夹中的JSON文件：

```json
{
  "name": "你想要的名字 #1",
  "description": "描述文字",
  ...
}
```

**两种命名策略：**

1. **统一格式 + 编号**（推荐）：
   - `"My NFT #1"`, `"My NFT #2"`, ...
   - 简单、自动化

2. **独特名称**（艺术家）：
   - `"破晓之光"`, `"午夜幽影"`, ...
   - 更有个性，需手动为每个NFT命名

详见 [`metadata/README.md`](./metadata/README.md)

## 🧪 测试

项目包含完整的测试套件，覆盖所有功能：

```bash
npm test
```

**测试覆盖：**
- ✅ 合约部署和初始化
- ✅ 铸造功能（成功/失败场景）
- ✅ 支付验证和退款
- ✅ 供应量和钱包限制
- ✅ Owner功能（价格、baseURI、提取）
- ✅ 权限控制
- ✅ 事件发射
- ✅ TokenURI生成

## 📡 事件监听（链下服务集成）

合约设计时考虑了链下服务的集成需求。以下是监听事件的示例：

```javascript
// 使用ethers.js监听事件
const myNFT = await ethers.getContractAt("MyNFT", contractAddress);

// 监听铸造事件
myNFT.on("Minted", (minter, tokenId, quantity, event) => {
  console.log(`${minter} 铸造了 ${quantity} 个NFT，起始tokenId: ${tokenId}`);
});

// 监听价格更新
myNFT.on("MintPriceUpdated", (newPrice, event) => {
  console.log(`铸造价格更新为: ${ethers.formatEther(newPrice)} ETH`);
});

// 监听提取事件
myNFT.on("Withdrawn", (receiver, amount, event) => {
  console.log(`${receiver} 提取了 ${ethers.formatEther(amount)} ETH`);
});
```

**查询历史事件：**

```javascript
// 获取所有铸造事件
const filter = myNFT.filters.Minted();
const events = await myNFT.queryFilter(filter);

events.forEach((event) => {
  console.log(`TokenId: ${event.args.tokenId}, Minter: ${event.args.minter}`);
});
```

## 🌊 OpenSea集成

### 查看您的NFT

部署后，您的NFT会自动出现在OpenSea上：

**Testnet (Sepolia):**
```
https://testnets.opensea.io/assets/sepolia/<合约地址>/<tokenId>
```

**Mainnet:**
```
https://opensea.io/assets/ethereum/<合约地址>/<tokenId>
```

### OpenSea会自动读取：

- NFT名称和符号（从合约）
- 元数据（从tokenURI）
- 图片和属性（从JSON）
- Owner信息
- 交易历史

### 设置Collection信息

在OpenSea上，您可以：
1. 访问您的Collection页面
2. 点击编辑按钮
3. 添加：
   - Collection封面图
   - Banner图
   - 描述
   - 社交媒体链接
   - 创作者费用（Royalty）

## 📚 常见问题

### 1. 如何修改最大供应量？

在 `contracts/MyNFT.sol` 中修改：

```solidity
uint256 public constant MAX_SUPPLY = 100; // 改为你想要的数量
```

### 2. 如何修改每钱包限制？

```solidity
uint256 public constant MAX_PER_WALLET = 5; // 改为你想要的限制
```

### 3. 如何实现白名单铸造？

需要添加白名单功能，可以参考：
- 使用Merkle Tree实现（节省gas）
- 或使用mapping存储白名单地址

### 4. Gas费用大概多少？

- 部署合约：~2-3M gas
- 铸造1个NFT：~100k gas
- 铸造3个NFT：~250k gas
- 修改价格/baseURI：~50k gas

### 5. 元数据可以修改吗？

- 如果使用HTTP URL：可以随时修改
- 如果使用IPFS：不可修改（内容寻址）
- 建议：测试阶段用HTTP，正式发布用IPFS

## 🔒 安全注意事项

1. ⚠️ **永远不要提交私钥到Git仓库**
2. ✅ 使用硬件钱包（如Ledger）部署主网合约
3. ✅ 在测试网充分测试后再部署主网
4. ✅ 考虑进行专业的安全审计（主网部署）
5. ✅ 确保元数据存储的持久性（推荐IPFS）

## 📖 更多资源

- [OpenZeppelin文档](https://docs.openzeppelin.com/)
- [Hardhat文档](https://hardhat.org/docs)
- [OpenSea开发者文档](https://docs.opensea.io/)
- [Ethereum开发文档](https://ethereum.org/developers)
- [Solidity文档](https://docs.soliditylang.org/)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

## 📞 下一步

1. 阅读 [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) 了解详细部署步骤
2. 阅读 [`metadata/README.md`](./metadata/README.md) 学习如何准备元数据
3. 运行测试确保一切正常
4. 部署到测试网进行测试
5. 准备元数据和图片
6. 部署到主网！

祝您的NFT项目成功！🎉


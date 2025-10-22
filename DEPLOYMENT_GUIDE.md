# 🚀 NFT项目部署完整指南

本指南将带您一步步完成NFT项目的部署，从环境准备到OpenSea上线。

## 📋 目录

1. [环境准备](#环境准备)
2. [获取测试ETH](#获取测试eth)
3. [配置项目](#配置项目)
4. [本地测试](#本地测试)
5. [部署到Sepolia测试网](#部署到sepolia测试网)
6. [验证合约](#验证合约)
7. [准备元数据](#准备元数据)
8. [在OpenSea查看](#在opensea查看)
9. [部署到主网](#部署到主网)
10. [常见问题排查](#常见问题排查)

---

## 🔧 环境准备

### 1. 安装Node.js

确保安装了Node.js（建议v18或更高版本）：

```bash
node --version  # 应该显示 v18.x.x 或更高
```

如果没有安装，访问 [nodejs.org](https://nodejs.org/) 下载安装。

### 2. 安装MetaMask

1. 访问 [metamask.io](https://metamask.io/)
2. 下载并安装浏览器插件
3. 创建钱包或导入现有钱包
4. **重要**：备份助记词，妥善保管

### 3. 克隆项目并安装依赖

```bash
cd /Users/jasonsu/Develop/web3_project/didotoken
npm install
```

---

## 💰 获取测试ETH

在测试网部署需要测试用的ETH（不需要花真钱）：

### Sepolia测试网水龙头

**方法1：Alchemy Faucet（推荐）**
1. 访问 [https://sepoliafaucet.com/](https://sepoliafaucet.com/)
2. 登录Alchemy账号（免费注册）
3. 输入您的钱包地址
4. 点击"Send Me ETH"
5. 等待1-2分钟，检查MetaMask余额

**方法2：Infura Faucet**
1. 访问 [https://www.infura.io/faucet/sepolia](https://www.infura.io/faucet/sepolia)
2. 输入钱包地址
3. 完成验证
4. 获取测试ETH

**方法3：QuickNode Faucet**
1. 访问 [https://faucet.quicknode.com/ethereum/sepolia](https://faucet.quicknode.com/ethereum/sepolia)
2. 连接钱包或输入地址
3. 获取测试ETH

> 💡 提示：建议获取至少0.5 Sepolia ETH用于部署和测试

---

## ⚙️ 配置项目

### 1. 创建.env文件

```bash
cp .env.template .env
```

### 2. 获取私钥

**从MetaMask导出私钥：**

1. 打开MetaMask
2. 点击账户详情（Account Details）
3. 点击"导出私钥"（Export Private Key）
4. 输入密码
5. 复制私钥（不要包含"0x"前缀）

⚠️ **安全警告**：
- 永远不要分享您的私钥
- 永远不要提交.env文件到Git
- 建议创建新钱包专门用于测试

### 3. 获取RPC URL

**使用Alchemy（推荐）：**

1. 访问 [https://www.alchemy.com/](https://www.alchemy.com/)
2. 注册免费账户
3. 创建新App：
   - 选择"Ethereum"
   - 选择"Sepolia"网络
4. 复制"HTTPS" URL

**或使用Infura：**

1. 访问 [https://infura.io/](https://infura.io/)
2. 注册账户
3. 创建新项目
4. 选择Sepolia网络
5. 复制"HTTPS" URL

### 4. 获取Etherscan API Key

1. 访问 [https://etherscan.io/](https://etherscan.io/)
2. 注册账户
3. 进入 [API Keys](https://etherscan.io/myapikey)
4. 创建新API Key
5. 复制API Key

### 5. 编辑.env文件

```env
PRIVATE_KEY=你的私钥（不要包含0x）
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/你的API_KEY
ETHERSCAN_API_KEY=你的Etherscan_API_Key
```

---

## 🧪 本地测试

在部署到测试网前，先在本地测试：

### 1. 编译合约

```bash
npm run compile
```

预期输出：
```
Compiled 1 Solidity file successfully
```

### 2. 运行测试

```bash
npm test
```

预期输出：
```
  MyNFT
    部署
      ✔ 应该正确设置合约名称和符号
      ✔ 应该正确设置owner
      ...
    铸造功能
      ✔ 应该能成功铸造1个NFT并发出Minted事件
      ...

  36 passing (2s)
```

### 3. 本地部署测试

**终端1 - 启动本地节点：**
```bash
npm run node
```

**终端2 - 部署到本地：**
```bash
npm run deploy:local
```

---

## 🌐 部署到Sepolia测试网

### 1. 自定义NFT名称（可选）

编辑 `scripts/deploy.js`：

```javascript
const NFT_NAME = "你的NFT名称";      // 例如："Dido Collection"
const NFT_SYMBOL = "你的符号";        // 例如："DIDO"
const BASE_URI = "临时URL";           // 例如："https://test.com/metadata/"
const MINT_PRICE = ethers.parseEther("0.01"); // 铸造价格
```

### 2. 执行部署

```bash
npm run deploy:sepolia
```

### 3. 记录输出信息

部署成功后，您会看到类似输出：

```
=================================
开始部署 MyNFT 合约...
=================================

部署账户: 0xYourAddress...
账户余额: 0.5 ETH

合约配置:
- NFT名称: MyNFT
- NFT符号: MNFT
- 初始 BaseURI: https://example.com/metadata/
- 初始铸造价格: 0.01 ETH
- 最大供应量: 100
- 每钱包限制: 5

正在部署合约...
✅ 合约部署成功！
合约地址: 0x1234567890abcdef1234567890abcdef12345678

=================================

验证合约部署...
合约信息:
- 名称: MyNFT
- 符号: MNFT
- 最大供应量: 100
- 每钱包限制: 5
- 铸造价格: 0.01 ETH
- Owner: 0xYourAddress...

=================================
🎉 部署完成！
=================================

📝 在 Etherscan 上验证合约（请等待几分钟后执行）:
npx hardhat verify --network sepolia 0x1234... "MyNFT" "MNFT" "https://example.com/metadata/" "10000000000000000"

📋 在 OpenSea Testnet 查看:
https://testnets.opensea.io/assets/sepolia/0x1234.../1
```

**重要**：保存合约地址和验证命令！

---

## ✅ 验证合约

等待1-2分钟后，在Etherscan上验证合约：

```bash
npx hardhat verify --network sepolia <合约地址> "MyNFT" "MNFT" "https://example.com/metadata/" "10000000000000000"
```

成功后访问：
```
https://sepolia.etherscan.io/address/<合约地址>
```

您应该能看到：
- ✅ 绿色对勾（已验证）
- "Contract Source Code Verified"
- 可读的Solidity代码

---

## 🎨 准备元数据

### 1. 准备图片

为您的NFT准备图片（推荐PNG格式）：
- 分辨率：建议1000x1000像素或更高
- 文件命名：`1.png`, `2.png`, ..., `100.png`

### 2. 创建元数据JSON文件

参考 `metadata/example.json`，为每个NFT创建JSON文件：

```json
{
  "name": "My NFT #1",
  "description": "这是我的第一个NFT",
  "image": "ipfs://QmYourImageHash/1.png",
  "attributes": [
    {"trait_type": "Background", "value": "Blue"},
    {"trait_type": "Rarity", "value": "Common"}
  ]
}
```

文件命名：`1.json`, `2.json`, ..., `100.json`

### 3. 上传到IPFS

**使用Pinata（最简单）：**

1. 访问 [https://www.pinata.cloud/](https://www.pinata.cloud/)
2. 注册免费账户（提供1GB免费存储）
3. 上传图片文件夹：
   - 点击"Upload" → "Folder"
   - 选择包含所有图片的文件夹
   - 等待上传完成
   - 复制CID（例如：`QmXXXX`）
4. 更新JSON文件中的图片链接：
   ```json
   "image": "ipfs://QmXXXX/1.png"
   ```
5. 上传元数据文件夹：
   - 上传包含所有JSON文件的文件夹
   - 复制CID（例如：`QmYYYY`）
6. 您的baseURI就是：`ipfs://QmYYYY/`

### 4. 更新合约的BaseURI

连接到合约并调用 `setBaseURI`：

**方法1：使用Etherscan**
1. 访问合约页面
2. 点击"Write Contract"
3. 点击"Connect to Web3"连接MetaMask
4. 找到 `setBaseURI` 函数
5. 输入：`ipfs://QmYYYY/`
6. 点击"Write"并确认交易

**方法2：使用Hardhat Console**
```bash
npx hardhat console --network sepolia
```

```javascript
const MyNFT = await ethers.getContractFactory("MyNFT");
const myNFT = await MyNFT.attach("0x您的合约地址");
await myNFT.setBaseURI("ipfs://QmYYYY/");
```

---

## 🌊 在OpenSea查看

### 1. 铸造测试NFT

**使用Etherscan：**
1. 访问合约的"Write Contract"页面
2. 连接MetaMask
3. 找到 `mint` 函数
4. 输入 `quantity`: `1`
5. 输入 `payableAmount`: `0.01`（或当前mint价格）
6. 点击"Write"并确认交易

### 2. 查看NFT

等待交易确认后，访问：
```
https://testnets.opensea.io/assets/sepolia/<合约地址>/1
```

您应该能看到：
- ✅ NFT图片
- ✅ 名称和描述
- ✅ 属性（Traits）
- ✅ Owner信息

### 3. 设置Collection信息

1. 访问Collection页面：
   ```
   https://testnets.opensea.io/collection/<collection-slug>
   ```
2. 点击右上角的编辑按钮
3. 添加：
   - Logo图片
   - Featured图片
   - Banner图片
   - 描述
   - 社交链接

---

## 🎯 部署到主网

⚠️ **在部署主网前，请确保：**

- ✅ 在测试网完整测试所有功能
- ✅ 所有元数据和图片已上传到IPFS
- ✅ 已在OpenSea testnet确认显示正确
- ✅ 钱包有足够的ETH支付gas费（建议至少0.1 ETH）
- ✅ 已进行安全审计（如果预算允许）

### 1. 配置主网

编辑 `hardhat.config.js`，添加：

```javascript
mainnet: {
  url: process.env.MAINNET_RPC_URL || "",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 1,
}
```

### 2. 更新.env

```env
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### 3. 部署

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

### 4. 验证

```bash
npx hardhat verify --network mainnet <合约地址> "名称" "符号" "baseURI" "价格"
```

### 5. OpenSea主网

访问：
```
https://opensea.io/assets/ethereum/<合约地址>/1
```

---

## 🔍 常见问题排查

### 问题1：部署失败 - "insufficient funds"

**原因**：钱包ETH不足

**解决**：
- 测试网：从水龙头获取更多测试ETH
- 主网：向钱包转入更多ETH

### 问题2：交易一直pending

**原因**：Gas价格太低或网络拥堵

**解决**：
- 等待更长时间
- 或取消交易，提高Gas价格重新发送

### 问题3：验证失败 - "Fail - Unable to verify"

**原因**：构造函数参数不匹配

**解决**：
```bash
# 确保参数顺序和类型完全一致
npx hardhat verify --network sepolia <地址> \
  "MyNFT" \
  "MNFT" \
  "https://example.com/metadata/" \
  "10000000000000000"
```

### 问题4：OpenSea上看不到图片

**原因**：元数据未正确配置或IPFS未固定

**解决**：
1. 检查 `tokenURI(1)` 返回值
2. 访问该URL确认JSON格式正确
3. 确认image字段的IPFS链接可访问
4. 在Pinata上确认文件已固定（Pinned）
5. 在OpenSea点击"Refresh metadata"

### 问题5：Private key错误

**原因**：私钥格式不正确

**解决**：
- 确保私钥不包含"0x"前缀
- 私钥应该是64个字符（不包含0x）
- 检查是否有多余的空格或换行

### 问题6：RPC错误

**原因**：RPC URL无效或API配额用完

**解决**：
- 确认URL格式正确
- 检查API Key是否有效
- 尝试使用其他RPC提供商

---

## 📞 需要帮助？

如果遇到问题：

1. 检查Hardhat控制台的完整错误信息
2. 查看交易hash在Etherscan上的详细信息
3. 参考 [Hardhat文档](https://hardhat.org/docs)
4. 参考 [OpenSea文档](https://docs.opensea.io/)

---

## 🎉 恭喜！

如果您走到这一步，说明您已经成功部署了自己的NFT项目！

**下一步：**
- 🎨 创建更多NFT艺术品
- 📣 在社交媒体推广您的Collection
- 🤝 与社区互动
- 📈 考虑添加Royalty（版税）设置

祝您的NFT项目大获成功！🚀


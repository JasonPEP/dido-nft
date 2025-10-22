# NFT 元数据指南

## 📖 什么是元数据？

NFT的元数据是一个JSON文件，包含了NFT的名称、描述、图片链接和属性等信息。OpenSea和其他NFT市场会读取这些信息来展示您的NFT。

## 📋 OpenSea元数据标准格式

```json
{
  "name": "NFT的名称",
  "description": "NFT的描述",
  "image": "图片的URL或IPFS链接",
  "external_url": "外部链接（可选）",
  "attributes": [
    {
      "trait_type": "属性类型",
      "value": "属性值"
    }
  ]
}
```

### 字段说明：

- **name**: NFT的显示名称（例如："My NFT #1"）
- **description**: NFT的详细描述
- **image**: 图片的完整URL
  - IPFS: `ipfs://QmHash/1.png`
  - HTTP: `https://example.com/images/1.png`
- **external_url**: （可选）指向外部网站的链接
- **attributes**: 属性数组，定义NFT的特征
  - `trait_type`: 属性类型（如"Background"、"Rarity"）
  - `value`: 属性值（如"Blue"、"Rare"）
  - `display_type`: （可选）显示类型，如"number"用于数字属性

## 🗂️ 文件组织结构

为100个NFT准备元数据时，建议按以下结构组织：

```
metadata/
├── 1.json
├── 2.json
├── 3.json
├── ...
└── 100.json

images/
├── 1.png
├── 2.png
├── 3.png
├── ...
└── 100.png
```

## 📤 上传到IPFS

### 方法1：使用 Pinata（推荐新手）

1. 访问 [Pinata.cloud](https://www.pinata.cloud/)
2. 注册免费账户
3. 上传图片文件夹：
   - 点击"Upload" → "Folder"
   - 选择您的`images`文件夹
   - 获得CID（例如：`QmImageHash`）
4. 更新所有JSON文件中的图片链接：
   ```json
   "image": "ipfs://QmImageHash/1.png"
   ```
5. 上传元数据文件夹：
   - 上传`metadata`文件夹
   - 获得CID（例如：`QmMetadataHash`）
6. 在合约中设置baseURI：
   ```
   setBaseURI("ipfs://QmMetadataHash/")
   ```

### 方法2：使用 NFT.Storage

1. 访问 [NFT.Storage](https://nft.storage/)
2. 注册免费账户（专为NFT设计，永久免费存储）
3. 上传流程同Pinata

### 方法3：使用 IPFS Desktop

1. 下载并安装 [IPFS Desktop](https://docs.ipfs.tech/install/ipfs-desktop/)
2. 将文件夹拖入IPFS Desktop
3. 复制CID

## 🔗 BaseURI设置

合约中的`baseURI`会自动拼接tokenId和".json"：

```
tokenURI(1) = baseURI + "1" + ".json"
```

**示例：**
- 如果 `baseURI = "ipfs://QmHash/"`
- 那么 `tokenURI(1) = "ipfs://QmHash/1.json"`

## ✅ 元数据检查清单

在部署前，确保：

- [ ] 所有JSON文件格式正确（使用JSON验证器）
- [ ] 图片已上传到IPFS或服务器
- [ ] JSON中的image链接指向正确的图片
- [ ] 文件命名为1.json, 2.json, ..., 100.json
- [ ] 所有属性（attributes）正确设置
- [ ] baseURI末尾有"/"（如果需要）

## 🧪 测试元数据

在部署到主网前，建议先在测试网测试：

1. 部署合约到Sepolia
2. 设置测试用的baseURI（可以先用HTTP URL）
3. 铸造一个测试NFT
4. 在OpenSea Testnet查看显示效果
5. 确认无误后，上传到IPFS并更新baseURI

## 📚 更多资源

- [OpenSea元数据标准](https://docs.opensea.io/docs/metadata-standards)
- [IPFS文档](https://docs.ipfs.tech/)
- [Pinata使用指南](https://docs.pinata.cloud/)
- [NFT.Storage文档](https://nft.storage/docs/)


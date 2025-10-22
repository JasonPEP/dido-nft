// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MyNFT
 * @dev ERC721 NFT合约，支持公开铸造、价格配置、每钱包限制和baseURI管理
 * @notice 此合约为个人NFT项目设计，可发布到OpenSea
 * 
 * 主要功能：
 * - 公开铸造（支付可配置的价格）
 * - 最大供应量限制（100个）
 * - 每个钱包最多铸造5个
 * - Owner可以修改铸造价格和baseURI
 * - Owner可以提取合约余额
 * - 所有关键操作都发出事件，便于链下服务索引
 */
contract MyNFT is ERC721, Ownable, ReentrancyGuard {
    
    // ============ 状态变量 ============
    
    /// @notice NFT的最大供应量
    uint256 public constant MAX_SUPPLY = 100;
    
    /// @notice 每个钱包最多可铸造的NFT数量
    uint256 public constant MAX_PER_WALLET = 5;
    
    /// @notice 当前的铸造价格（单位：wei）
    uint256 public mintPrice;
    
    /// @notice 元数据的基础URI
    string private baseTokenURI;
    
    /// @notice 当前已铸造的NFT数量（也是下一个tokenId）
    uint256 private _tokenIdCounter;
    
    /// @notice 记录每个地址已铸造的NFT数量
    mapping(address => uint256) public mintedPerWallet;
    
    // ============ 事件 ============
    
    /**
     * @notice 当NFT被铸造时发出
     * @param minter 铸造者的地址
     * @param tokenId 铸造的NFT的tokenId
     * @param quantity 本次铸造的数量
     */
    event Minted(
        address indexed minter,
        uint256 indexed tokenId,
        uint256 quantity
    );
    
    /**
     * @notice 当铸造价格被更新时发出
     * @param newPrice 新的铸造价格
     */
    event MintPriceUpdated(uint256 newPrice);
    
    /**
     * @notice 当baseURI被更新时发出
     * @param newBaseURI 新的baseURI
     */
    event BaseURIUpdated(string newBaseURI);
    
    /**
     * @notice 当合约余额被提取时发出
     * @param receiver 接收者地址
     * @param amount 提取金额
     */
    event Withdrawn(address indexed receiver, uint256 amount);
    
    // ============ 自定义错误 ============
    
    error ExceedsMaxSupply();
    error ExceedsMaxPerWallet();
    error InsufficientPayment();
    error WithdrawFailed();
    error InvalidQuantity();
    
    // ============ 构造函数 ============
    
    /**
     * @notice 初始化NFT合约
     * @param _name NFT系列名称（例如："My NFT Collection"）
     * @param _symbol NFT代币符号（例如："MNFT"）
     * @param _baseTokenURI 元数据的初始baseURI
     * @param _mintPrice 初始铸造价格（单位：wei）
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseTokenURI,
        uint256 _mintPrice
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        baseTokenURI = _baseTokenURI;
        mintPrice = _mintPrice;
        _tokenIdCounter = 1; // tokenId从1开始
    }
    
    // ============ 公开函数 ============
    
    /**
     * @notice 公开铸造函数，任何人都可以调用
     * @param quantity 要铸造的NFT数量
     * @dev 需要支付 mintPrice * quantity 的ETH
     */
    function mint(uint256 quantity) external payable nonReentrant {
        // 验证铸造数量
        if (quantity == 0) revert InvalidQuantity();
        
        // 检查是否超过最大供应量
        if (_tokenIdCounter + quantity - 1 > MAX_SUPPLY) {
            revert ExceedsMaxSupply();
        }
        
        // 检查是否超过每钱包限制
        if (mintedPerWallet[msg.sender] + quantity > MAX_PER_WALLET) {
            revert ExceedsMaxPerWallet();
        }
        
        // 检查支付金额
        uint256 totalPrice = mintPrice * quantity;
        if (msg.value < totalPrice) {
            revert InsufficientPayment();
        }
        
        // 更新钱包铸造记录
        mintedPerWallet[msg.sender] += quantity;
        
        // 批量铸造
        uint256 startTokenId = _tokenIdCounter;
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            _safeMint(msg.sender, tokenId);
            _tokenIdCounter++;
        }
        
        // 发出铸造事件
        emit Minted(msg.sender, startTokenId, quantity);
        
        // 退还多余的ETH
        if (msg.value > totalPrice) {
            (bool success, ) = msg.sender.call{value: msg.value - totalPrice}("");
            require(success, "Refund failed");
        }
    }
    
    /**
     * @notice 获取当前已铸造的NFT总数
     * @return 已铸造的数量
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    // ============ Owner函数 ============
    
    /**
     * @notice Owner设置新的铸造价格
     * @param newPrice 新价格（单位：wei）
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }
    
    /**
     * @notice Owner设置新的baseURI
     * @param newBaseURI 新的baseURI字符串
     * @dev 可以用于从临时URL切换到IPFS，或更新元数据位置
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }
    
    /**
     * @notice Owner提取合约中的所有ETH
     * @dev 使用ReentrancyGuard防止重入攻击
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        if (!success) revert WithdrawFailed();
        
        emit Withdrawn(owner(), balance);
    }
    
    // ============ 内部函数 ============
    
    /**
     * @notice 返回baseURI
     * @dev 重写ERC721的_baseURI函数
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }
    
    // ============ 查询函数 ============
    
    /**
     * @notice 获取指定tokenId的完整URI
     * @param tokenId NFT的tokenId
     * @return 完整的token URI
     * @dev 返回 baseURI + tokenId + ".json"
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, _toString(tokenId), ".json"))
            : "";
    }
    
    /**
     * @notice 将uint256转换为字符串
     * @param value 要转换的数字
     * @return 字符串表示
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title CharityRegistry
 * @dev Registry component for the Eunoia platform
 */
contract CharityRegistry {
    // Maps charity name hash to its wallet address
    mapping(bytes32 => address) private charityWallets;
    
    // Contract owner/admin address
    address public owner;
    
    // --- Events ---
    event CharityRegistered(bytes32 indexed charityNameHash, address charityWallet);
    
    // --- Errors ---
    error NotOwner();
    error CharityAlreadyExists();
    error CharityNotFound();
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }
    
    /**
     * @dev Register a new charity with the platform
     * @param charityNameHash Hash of the charity name
     * @param charityWalletAddr Address of the charity's wallet
     */
    function addCharity(bytes32 charityNameHash, address charityWalletAddr) external onlyOwner {
        if (charityWallets[charityNameHash] != address(0)) revert CharityAlreadyExists();
        
        charityWallets[charityNameHash] = charityWalletAddr;
        
        emit CharityRegistered(charityNameHash, charityWalletAddr);
    }
    
    /**
     * @dev Gets the wallet address for a given charity name hash
     * @param charityNameHash Hash of the charity name
     * @return Address of the charity's wallet
     */
    function getCharityWallet(bytes32 charityNameHash) external view returns (address) {
        address charityWallet = charityWallets[charityNameHash];
        if (charityWallet == address(0)) revert CharityNotFound();
        return charityWallet;
    }
    
    /**
     * @dev Checks if a charity exists
     * @param charityNameHash Hash of the charity name
     * @return True if charity exists
     */
    function charityExists(bytes32 charityNameHash) external view returns (bool) {
        return charityWallets[charityNameHash] != address(0);
    }
}

/**
 * @title DonationTracker
 * @dev Tracks donations for the Eunoia platform
 */
contract DonationTracker {
    // Maps charity name hash to (maps token name hash to total amount raised)
    mapping(bytes32 => mapping(bytes32 => uint256)) private charityRaisedAmounts;
    
    // --- Events ---
    event DonationRecorded(
        address indexed donor,
        bytes32 charityNameHash,
        bytes32 tokenNameHash,
        uint256 amount,
        uint256 timestamp
    );
    
    /**
     * @dev Records a donation
     * @param donor Address of the donor
     * @param charityNameHash Hash of the charity name
     * @param tokenNameHash Hash of the token name
     * @param amount Amount donated
     */
    function recordDonation(
        address donor,
        bytes32 charityNameHash,
        bytes32 tokenNameHash,
        uint256 amount
    ) external {
        charityRaisedAmounts[charityNameHash][tokenNameHash] += amount;
        
        emit DonationRecorded(
            donor,
            charityNameHash,
            tokenNameHash,
            amount,
            block.timestamp
        );
    }
    
    /**
     * @dev Gets the total amount raised by a specific charity for a specific token type
     * @param charityNameHash Hash of the charity name
     * @param tokenNameHash Hash of the token name
     * @return Total amount raised
     */
    function getCharityRaisedAmount(bytes32 charityNameHash, bytes32 tokenNameHash) 
        external view returns (uint256) 
    {
        return charityRaisedAmounts[charityNameHash][tokenNameHash];
    }
}

/**
 * @title DonationHistory
 * @dev Stores donation history for the Eunoia platform
 */
contract DonationHistory {
    // Represents a single donation event (optimized for storage)
    struct HistoryEntry {
        bytes32 charityNameHash;
        bytes32 tokenNameHash;
        uint256 amountDonated;
        uint256 timestamp;
    }
    
    // Maps donor address to their donation history entries
    mapping(address => HistoryEntry[]) private histories;
    
    /**
     * @dev Records a donation in history
     * @param donor Address of the donor
     * @param charityNameHash Hash of the charity name
     * @param tokenNameHash Hash of the token name
     * @param amount Amount donated
     */
    function recordHistory(
        address donor,
        bytes32 charityNameHash,
        bytes32 tokenNameHash,
        uint256 amount
    ) external {
        HistoryEntry memory historyEntry = HistoryEntry({
            charityNameHash: charityNameHash,
            tokenNameHash: tokenNameHash,
            amountDonated: amount,
            timestamp: block.timestamp
        });
        
        histories[donor].push(historyEntry);
    }
    
    /**
     * @dev Gets the donation history for a given donor address
     * @param donorAddr Address of the donor
     * @return Array of HistoryEntry structs
     */
    function getDonationHistory(address donorAddr) external view returns (HistoryEntry[] memory) {
        return histories[donorAddr];
    }
}

/**
 * @title EunoiaFoundation
 * @dev Main contract for the Eunoia charity donation platform
 */
contract EunoiaFoundation {
    CharityRegistry public charityRegistry;
    DonationTracker public donationTracker;
    DonationHistory public donationHistory;
    
    // --- Errors ---
    error InvalidDonationAmount();
    error CharityNotFound();
    error TransferFailed();
    
    constructor() {
        charityRegistry = new CharityRegistry();
        donationTracker = new DonationTracker();
        donationHistory = new DonationHistory();
    }
    
    /**
     * @dev Register a new charity with the platform
     * @param charityName Name of the charity
     * @param charityWalletAddr Address of the charity's wallet
     */
    function addCharity(
        string calldata charityName,
        address charityWalletAddr
    ) external {
        bytes32 charityNameHash = keccak256(bytes(charityName));
        charityRegistry.addCharity(charityNameHash, charityWalletAddr);
    }
    
    /**
     * @dev Donate native tokens to a charity
     * @param charityName Name of the charity to donate to
     * @param tokenName Identifier string for the token type
     */
    function donate(
        string calldata charityName,
        string calldata tokenName
    ) external payable {
        if (msg.value == 0) revert InvalidDonationAmount();
        
        bytes32 charityNameHash = keccak256(bytes(charityName));
        bytes32 tokenNameHash = keccak256(bytes(tokenName));
        
        // Get charity wallet address
        address charityWalletAddr = charityRegistry.getCharityWallet(charityNameHash);
        
        // Transfer the native tokens to the charity
        (bool success, ) = charityWalletAddr.call{value: msg.value}("");
        if (!success) revert TransferFailed();
        
        // Record donation data
        donationTracker.recordDonation(msg.sender, charityNameHash, tokenNameHash, msg.value);
        donationHistory.recordHistory(msg.sender, charityNameHash, tokenNameHash, msg.value);
    }
    
    /**
     * @dev Gets the donation history for a given donor address
     * @param donorAddr Address of the donor
     */
    function getDonationHistory(address donorAddr) external view returns (DonationHistory.HistoryEntry[] memory) {
        return donationHistory.getDonationHistory(donorAddr);
    }
    
    /**
     * @dev Gets the total amount raised by a specific charity for a specific token type
     * @param charityName Name of the charity
     * @param tokenName Name of the token
     */
    function getCharityRaisedAmount(string calldata charityName, string calldata tokenName) 
        external view returns (uint256) 
    {
        bytes32 charityNameHash = keccak256(bytes(charityName));
        bytes32 tokenNameHash = keccak256(bytes(tokenName));
        return donationTracker.getCharityRaisedAmount(charityNameHash, tokenNameHash);
    }
    
    /**
     * @dev Gets the wallet address for a given charity name
     * @param charityName Name of the charity
     */
    function getCharityWallet(string calldata charityName) external view returns (address) {
        bytes32 charityNameHash = keccak256(bytes(charityName));
        return charityRegistry.getCharityWallet(charityNameHash);
    }
}
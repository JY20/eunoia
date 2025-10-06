// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title EunoiaFoundation
 * @dev A charity donation platform for Polkadot/Westend
 * @custom:equivalent-to Aptos eunoia::eunoia_foundation module
 */
contract EunoiaFoundation {
    // --- Structs ---
    
    // Represents a single donation event
    struct HistoryEntry {
        string charityName;
        string tokenName;      // Name of the token donated
        uint256 amountDonated;
        address donorAddress;
        uint256 timestamp;
    }
    
    // --- Storage ---
    
    // Maps donor address to their donation history entries
    mapping(address => HistoryEntry[]) private histories;
    
    // Maps charity name to its wallet address
    mapping(string => address) private charityWallets;
    
    // Maps charity name to (maps token name to total amount raised for that token)
    mapping(string => mapping(string => uint256)) private charityRaisedAmounts;
    
    // Contract owner/admin address
    address public owner;
    
    // --- Events ---
    
    event DonateEvent(
        address indexed donor,
        string charityName,
        string tokenName,
        uint256 amount,
        uint256 timestamp
    );
    
    event CharityRegisteredEvent(
        string charityName,
        address charityWallet,
        address indexed admin
    );
    
    // --- Errors ---
    
    error ModuleNotInitialized();
    error AlreadyInitialized();
    error CharityAlreadyExists();
    error CharityNotFound();
    error InvalidDonationAmount();
    error CharityNotRegisteredForToken();
    error NotModuleOwner();
    error InsufficientBalance();
    
    // --- Constructor ---
    
    constructor() {
        owner = msg.sender;
    }
    
    // --- Modifiers ---
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotModuleOwner();
        _;
    }
    
    // --- Charity Management Functions ---
    
    /**
     * @dev Register a new charity with the platform
     * @param charityName Name of the charity
     * @param charityWalletAddr Address of the charity's wallet
     */
    function addCharity(
        string calldata charityName,
        address charityWalletAddr
    ) external onlyOwner {
        if (charityWallets[charityName] != address(0)) revert CharityAlreadyExists();
        
        charityWallets[charityName] = charityWalletAddr;
        
        emit CharityRegisteredEvent(
            charityName,
            charityWalletAddr,
            msg.sender
        );
    }
    
    // --- User Interaction Functions ---
    
    /**
     * @dev Donate native tokens to a charity
     * @param charityName Name of the charity to donate to
     * @param tokenName Identifier string for the token type (for native token, use "DOT" or "WND")
     * @param amount Amount to donate
     */
    function donate(
        string calldata charityName,
        string calldata tokenName,
        uint256 amount
    ) external payable {
        // For native token donations, amount must match msg.value
        if (keccak256(bytes(tokenName)) == keccak256(bytes("DOT")) || 
            keccak256(bytes(tokenName)) == keccak256(bytes("WND"))) {
            require(msg.value == amount, "Amount must match sent value");
        } else {
            // For other tokens, this would require ERC20 implementation
            // which is not included in this basic version
            revert("Only native token donations supported in this version");
        }
        
        if (amount == 0) revert InvalidDonationAmount();
        if (charityWallets[charityName] == address(0)) revert CharityNotFound();
        
        address charityWalletAddr = charityWallets[charityName];
        
        // Transfer the native tokens to the charity
        (bool success, ) = charityWalletAddr.call{value: amount}("");
        require(success, "Transfer failed");
        
        // Update total raised amount for the charity and specific token type
        charityRaisedAmounts[charityName][tokenName] += amount;
        
        // Record the donation in history
        uint256 donationTime = block.timestamp;
        HistoryEntry memory historyEntry = HistoryEntry({
            charityName: charityName,
            tokenName: tokenName,
            amountDonated: amount,
            donorAddress: msg.sender,
            timestamp: donationTime
        });
        
        histories[msg.sender].push(historyEntry);
        
        emit DonateEvent(
            msg.sender,
            charityName,
            tokenName,
            amount,
            donationTime
        );
    }
    
    // --- View Functions ---
    
    /**
     * @dev Gets the donation history for a given donor address
     * @param donorAddr Address of the donor
     * @return Array of HistoryEntry structs
     */
    function getDonationHistory(address donorAddr) external view returns (HistoryEntry[] memory) {
        return histories[donorAddr];
    }
    
    /**
     * @dev Gets the total amount raised by a specific charity for a specific token type
     * @param charityName Name of the charity
     * @param tokenName Name of the token
     * @return Total amount raised
     */
    function getCharityRaisedAmount(string calldata charityName, string calldata tokenName) 
        external view returns (uint256) 
    {
        return charityRaisedAmounts[charityName][tokenName];
    }
    
    /**
     * @dev Gets the wallet address for a given charity name
     * @param charityName Name of the charity
     * @return Address of the charity's wallet
     */
    function getCharityWallet(string calldata charityName) external view returns (address) {
        address charityWallet = charityWallets[charityName];
        if (charityWallet == address(0)) revert CharityNotFound();
        return charityWallet;
    }
    
    // --- Advanced functionality (for future extensions) ---
    
    /**
     * @dev Function to support ERC20 token donations (not implemented in this basic version)
     * This would require integration with PSP22 (Polkadot's ERC20 equivalent)
     */
    // function donateToken(address tokenContract, string calldata charityName, uint256 amount) external {
    //     // Implementation would go here
    // }
}
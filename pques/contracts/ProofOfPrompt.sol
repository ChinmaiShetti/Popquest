// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ProofOfPrompt
 * @dev A blockchain-based system for registering and verifying AI-generated content
 * 
 * This contract allows users to:
 * 1. Register AI-generated content with an immutable timestamp
 * 2. Verify ownership and authenticity of content
 * 3. Prove the original prompt that generated the content
 * 
 * Use cases:
 * - Prove you were the first to generate specific AI content
 * - Detect plagiarism of AI outputs
 * - Create timestamped proof of creation
 * - Build a portfolio of your AI-generated work
 */

contract ProofOfPrompt {
    
    // ============ STATE VARIABLES ============
    
    /**
     * @dev Main storage structure for each piece of registered content
     * 
     * Fields explained:
     * - author: The wallet address that registered this content
     * - contentHash: SHA256 hash of (prompt + output + timestamp combined)
     * - timestamp: When this was registered (in Unix seconds)
     * - promptIPFSHash: Optional link to IPFS for storing the full prompt text
     */
    struct ContentRegistry {
        address author;
        bytes32 contentHash;
        uint256 timestamp;
        string promptIPFSHash;
    }

    // Master mapping: contentHash => ContentRegistry
    // This is like a giant immutable database on the blockchain
    mapping(bytes32 => ContentRegistry) public registry;

    // Quick lookup: Does this hash exist? (for gas-efficient checks)
    mapping(bytes32 => bool) public hashExists;

    // Author tracking: owner => array of their content hashes
    // Allows authors to see all their registered content
    mapping(address => bytes32[]) public authorContent;

    // Counter for total registrations (useful for analytics)
    uint256 public totalRegistrations = 0;

    // Owner of the contract (for potential admin functions later)
    address public contractOwner;

    
    // ============ EVENTS ============
    
    /**
     * @dev Fired when new content is registered
     * Frontend apps listen to this event to show real-time updates
     */
    event ContentRegistered(
        address indexed author,
        bytes32 indexed contentHash,
        uint256 timestamp,
        uint256 totalRegistrations
    );

    /**
     * @dev Fired when content is verified
     * Useful for tracking verification activity
     */
    event ContentVerified(
        bytes32 indexed contentHash,
        address indexed author,
        uint256 registeredAt,
        bool isValid
    );

    /**
     * @dev Fired when someone tries to register duplicate content
     * Could indicate either honest users or potential attacks
     */
    event DuplicateRegistrationAttempt(
        address indexed attemptedBy,
        bytes32 contentHash
    );

    
    // ============ MODIFIERS ============
    
    /**
     * @dev Ensures only the contract owner can call certain functions
     * Useful for future admin operations
     */
    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Only owner can call this");
        _;
    }

    /**
     * @dev Ensures the provided hash is valid (not zero)
     * Prevents accidental registration of empty content
     */
    modifier validHash(bytes32 _hash) {
        require(_hash != bytes32(0), "Content hash cannot be empty (0x0...)");
        _;
    }

    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Initialize the contract
     * Sets the deployer as the contract owner
     */
    constructor() {
        contractOwner = msg.sender;
    }

    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Register a new piece of AI-generated content on the blockchain
     * @dev This creates an immutable record that cannot be changed or deleted
     * 
     * @param contentHash The SHA256 hash of your (prompt + output + timestamp)
     * @param promptIPFSHash Optional: IPFS hash if you're storing full prompt text
     * 
     * How to generate contentHash:
     * 1. Combine: prompt + "|" + output + "|" + timestamp
     * 2. Run through SHA256
     * 3. Convert to bytes32 hex
     * 
     * The frontend does this automatically, but here's how it works:
     * - Prompt: "Write a poem about cats"
     * - Output: "Whiskers soft and grey..."
     * - Timestamp: 1634567890
     * - Combined: "Write a poem about cats|Whiskers soft and grey...|1634567890"
     * - SHA256 Hash: 0xabcdef... (256 bits = 32 bytes)
     * - This hash goes on the blockchain forever
     */
    function registerContent(
        bytes32 contentHash,
        string calldata promptIPFSHash
    ) 
        external 
        validHash(contentHash)
    {
        // Safety check 1: Prevent registering the same content twice
        if (hashExists[contentHash]) {
            emit DuplicateRegistrationAttempt(msg.sender, contentHash);
            revert("Content already registered");
        }

        // Create and store the registration record
        registry[contentHash] = ContentRegistry({
            author: msg.sender,              // Automatically gets caller's address
            contentHash: contentHash,
            timestamp: block.timestamp,      // Current Ethereum block timestamp
            promptIPFSHash: promptIPFSHash   // Empty string if not provided
        });

        // Track this content in the author's portfolio
        authorContent[msg.sender].push(contentHash);
        
        // Mark hash as existing for quick lookups
        hashExists[contentHash] = true;

        // Increment global counter
        totalRegistrations++;

        // Broadcast event for listening apps
        emit ContentRegistered(
            msg.sender,
            contentHash,
            block.timestamp,
            totalRegistrations
        );
    }

    /**
     * @notice Verify if a piece of content exists in the registry
     * @dev Call this to check if someone actually created something
     * 
     * @param contentHash The hash to verify
     * @return exists True if the content was found and is registered
     * @return author The wallet address that registered it
     * @return timestamp When it was registered (Unix epoch seconds)
     * @return promptIPFSHash The IPFS link if provided
     * 
     * Example flow:
     * 1. Someone claims they wrote "The Greatest Poem Ever"
     * 2. You hash their claim: hash = SHA256("The Greatest Poem Ever|...")
     * 3. You call verifyContent(hash)
     * 4. If exists = true, they're telling the truth!
     * 5. If exists = false, they're lying or forgot to register it
     */
    function verifyContent(bytes32 contentHash)
        external
        view
        returns (
            bool exists,
            address author,
            uint256 timestamp,
            string memory promptIPFSHash
        )
    {
        // Check if the hash exists in our registry
        if (hashExists[contentHash]) {
            // Retrieve the stored data
            ContentRegistry storage content = registry[contentHash];
            
            // Return all the details (view function cannot emit events)
            return (
                true,                      // Content exists
                content.author,            // Who registered it
                content.timestamp,         // When
                content.promptIPFSHash     // Optional IPFS link
            );
        }
        
        // Content not found - return empty result
        return (false, address(0), 0, "");
    }

    /**
     * @notice Get all content registered by a specific author
     * @dev Useful for building user profiles or portfolios
     * 
     * @param author The wallet address to look up
     * @return Array of all content hashes they've registered
     * 
     * Example use:
     * - Author: 0x1234...
     * - Returns: [0xabc..., 0xdef..., 0x123...]
     * - Each hash represents content they created
     */
    function getAuthorContent(address author)
        external
        view
        returns (bytes32[] memory)
    {
        return authorContent[author];
    }

    /**
     * @notice Get detailed information about a specific piece of content
     * @dev Call this to see who made something and when
     * 
     * @param contentHash The hash to look up
     * @return author Who registered this content
     * @return timestamp When they registered it
     * @return promptIPFSHash Where the full prompt is stored (optional)
     * 
     * Reverts if content doesn't exist - safety check
     */
    function getContentDetails(bytes32 contentHash)
        external
        view
        validHash(contentHash)
        returns (
            address author,
            uint256 timestamp,
            string memory promptIPFSHash
        )
    {
        require(hashExists[contentHash], "Content not found in registry");
        
        ContentRegistry storage content = registry[contentHash];
        return (content.author, content.timestamp, content.promptIPFSHash);
    }

    /**
     * @notice Count how many pieces of content an author has registered
     * @dev Faster than getting full array if you just need the count
     * 
     * @param author The wallet address
     * @return Number of content pieces they've registered
     */
    function getAuthorContentCount(address author)
        external
        view
        returns (uint256)
    {
        return authorContent[author].length;
    }

    /**
     * @notice Get global statistics about the platform
     * @dev Useful for showing platform growth
     * 
     * @return total Total number of registrations
     * @return owner Address of contract owner
     */
    function getPlatformStats()
        external
        view
        returns (uint256 total, address owner)
    {
        return (totalRegistrations, contractOwner);
    }

    /**
     * @notice Check if a specific hash is already registered
     * @dev Fast way to check before registering
     * 
     * @param contentHash The hash to check
     * @return True if this hash is already in the registry
     */
    function isContentRegistered(bytes32 contentHash)
        external
        view
        returns (bool)
    {
        return hashExists[contentHash];
    }


    // ============ EMERGENCY FUNCTIONS ============
    
    /**
     * @notice Allow owner to renounce ownership (optional)
     * @dev Makes contract truly immutable - can't add backdoors later
     * Use this if you want to prove no one can change the contract
     */
    function renounceOwnership() external onlyOwner {
        contractOwner = address(0);
    }
}
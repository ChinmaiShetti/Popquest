// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// ============ CONTRACT CONFIGURATION ============

// Get contract address from environment variables (set in .env.local)
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

/**
 * CONTRACT ABI (Application Binary Interface)
 * This tells ethers.js what functions exist on the smart contract
 * Each object describes a function and its parameters
 * 
 * The frontend uses this to know:
 * - What functions can be called
 * - What parameters they need
 * - What they return
 * - Whether they cost gas (write functions) or not (read functions)
 */
const CONTRACT_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "author",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "contentHash",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalRegistrations",
          "type": "uint256"
        }
      ],
      "name": "ContentRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "contentHash",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "author",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "registeredAt",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isValid",
          "type": "bool"
        }
      ],
      "name": "ContentVerified",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "attemptedBy",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "contentHash",
          "type": "bytes32"
        }
      ],
      "name": "DuplicateRegistrationAttempt",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "authorContent",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "contractOwner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "author",
          "type": "address"
        }
      ],
      "name": "getAuthorContent",
      "outputs": [
        {
          "internalType": "bytes32[]",
          "name": "",
          "type": "bytes32[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "author",
          "type": "address"
        }
      ],
      "name": "getAuthorContentCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "contentHash",
          "type": "bytes32"
        }
      ],
      "name": "getContentDetails",
      "outputs": [
        {
          "internalType": "address",
          "name": "author",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "promptIPFSHash",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPlatformStats",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "total",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "hashExists",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "contentHash",
          "type": "bytes32"
        }
      ],
      "name": "isContentRegistered",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "contentHash",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "promptIPFSHash",
          "type": "string"
        }
      ],
      "name": "registerContent",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "registry",
      "outputs": [
        {
          "internalType": "address",
          "name": "author",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "contentHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "promptIPFSHash",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalRegistrations",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "contentHash",
          "type": "bytes32"
        }
      ],
      "name": "verifyContent",
      "outputs": [
        {
          "internalType": "bool",
          "name": "exists",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "author",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "promptIPFSHash",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
// ============ MAIN APP COMPONENT ============

export default function App() {
  
  // ========== WALLET STATE ==========
  
  // The Ethereum provider (connection to blockchain)
  const [provider, setProvider] = useState(null);
  
  // The signer (object that can sign transactions with your private key)
  const [signer, setSigner] = useState(null);
  
  // Currently connected wallet address
  const [account, setAccount] = useState(null);
  
  // The smart contract object (lets us call functions)
  const [contract, setContract] = useState(null);
  
  // Is the wallet currently connected?
  const [isConnected, setIsConnected] = useState(false);

  
  // ========== UI STATE ==========
  
  // Which tab is active: 'register' or 'verify'
  const [activeTab, setActiveTab] = useState('register');

  
  // ========== REGISTER TAB STATE ==========
  
  // The prompt the user entered (what they asked the AI)
  const [prompt, setPrompt] = useState('');
  
  // The AI output they're registering
  const [output, setOutput] = useState('');
  
  // Are we currently registering? (shows loading state)
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Status message to show user (success/error)
  const [registerStatus, setRegisterStatus] = useState('');

  
  // ========== VERIFY TAB STATE ==========
  
  // The hash they want to verify
  const [verifyHash, setVerifyHash] = useState('');
  
  // Are we currently verifying?
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Results from verification
  const [verifyResult, setVerifyResult] = useState(null);

  
  // ========== PLATFORM STATS ==========
  
  const [stats, setStats] = useState({ total: 0, owner: null });

  
  // ========== EFFECTS ==========
  
  /**
   * This runs once when the component first loads
   * It sets up the connection to Ethereum
   */
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const initProvider = async () => {
        try {
          // Create provider (connection to Ethereum)
          const p = new ethers.BrowserProvider(window.ethereum);
          setProvider(p);

          // Check if user already has connected wallets
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          
          // If they do, auto-connect
          if (accounts.length > 0) {
            handleConnect();
          }

          // Listen for when user switches accounts in MetaMask
          window.ethereum.on('accountsChanged', handleConnect);
          
          // Listen for when user switches networks
          window.ethereum.on('chainChanged', () => window.location.reload());
        } catch (error) {
          console.error('Provider initialization failed:', error);
          setRegisterStatus('❌ Failed to initialize Web3. Is MetaMask installed?');
        }
      };
      
      initProvider();
    }
  }, []);

  
  // ========== WALLET FUNCTIONS ==========
  
  /**
   * Connect to MetaMask and initialize the contract
   * This is called when user clicks "Connect MetaMask"
   */
  const handleConnect = async () => {
    try {
      if (!provider) {
        setRegisterStatus('❌ Provider not initialized');
        return;
      }

      // Request account access from MetaMask
      // This pops up the MetaMask permission dialog
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create a new provider (fresh connection)
      const p = new ethers.BrowserProvider(window.ethereum);
      
      // Get signer (the object that signs transactions)
      const s = await p.getSigner();
      
      // Get the wallet address from signer
      const addr = await s.getAddress();

      // Update state
      setSigner(s);
      setAccount(addr);
      setIsConnected(true);

      // Initialize contract with the signer
      // Now we can call functions that modify state (write functions)
      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, s);
      setContract(c);

      // Fetch and display platform stats
      try {
        const [total, owner] = await c.getPlatformStats();
        setStats({ total: total.toString(), owner });
      } catch (e) {
        console.log('Could not fetch stats:', e);
      }

      // Show success message with shortened address
      const shortAddr = `${addr.substring(0, 6)}...${addr.substring(38)}`;
      setRegisterStatus(`✅ Connected: ${shortAddr}`);
      
    } catch (error) {
      console.error('Connection error:', error);
      setRegisterStatus('❌ Failed to connect wallet. Did you approve MetaMask?');
    }
  };

  /**
   * Disconnect the wallet (clear all state)
   */
  const handleDisconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setContract(null);
    setIsConnected(false);
    setRegisterStatus('');
  };

  
  // ========== HASHING FUNCTIONS ==========
  
  /**
   * Hash text using SHA-256 (browser's crypto API)
   * This creates a unique fingerprint of the content
   * 
   * SHA-256 is:
   * - Deterministic: Same input always produces same hash
   * - One-way: Can't reverse a hash back to original
   * - Collision-free: Almost impossible to find two inputs with same hash
   * 
   * @param text The text to hash
   * @returns The hash as a hex string (0x...)
   */
  const hashContent = async (text) => {
    try {
      // 1. Convert text to bytes
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      // 2. Run SHA-256 on it (browser's built-in crypto)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      // 3. Convert result to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hexString = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      
      // 4. Add "0x" prefix to make it a valid Ethereum bytes32
      return '0x' + hexString;
      
    } catch (error) {
      console.error('Hashing failed:', error);
      throw new Error('Failed to hash content');
    }
  };

  
  // ========== REGISTER FUNCTION ==========
  
  /**
   * Register content on the blockchain
   * This is called when user clicks "Register Content"
   */
  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!isConnected) {
      setRegisterStatus('❌ Please connect your wallet first');
      return;
    }

    if (!contract) {
      setRegisterStatus('❌ Contract not initialized');
      return;
    }

    if (!prompt.trim() || !output.trim()) {
      setRegisterStatus('❌ Please fill in both Prompt and Output fields');
      return;
    }

    try {
      setIsRegistering(true);
      setRegisterStatus('⏳ Preparing content...');

      // Step 1: Combine prompt + output + timestamp
      // This ensures each combination is unique
      const timestamp = Date.now();
      const combined = `${prompt}|${output}|${timestamp}`;
      
      setRegisterStatus('⏳ Hashing content (this is instant)...');
      
      // Step 2: Hash the combined string
      const hash = await hashContent(combined);
      
      setRegisterStatus(`⏳ Sending to blockchain...\nHash: ${hash.substring(0, 20)}...`);

      // Step 3: Call the smart contract
      // This triggers MetaMask to ask for signature/confirmation
      const tx = await contract.registerContent(hash, '');
      
      setRegisterStatus('⏳ Waiting for blockchain confirmation (30-60 seconds)...');

      // Step 4: Wait for transaction to be mined
      const receipt = await tx.wait();

      // Success!
      setRegisterStatus(
        `✅ Success! Registered on blockchain!\n📦 Transaction: ${receipt.hash.substring(0, 20)}...\n🔐 Your hash (copied to clipboard):\n${hash}`
      );
      
      // Copy hash to clipboard for easy sharing
      navigator.clipboard.writeText(hash).catch(() => {
        console.log('Could not copy to clipboard');
      });

      // Update stats
      try {
        const [total, owner] = await contract.getPlatformStats();
        setStats({ total: total.toString(), owner });
      } catch (e) {
        console.log('Could not update stats');
      }

      // Clear form
      setPrompt('');
      setOutput('');
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Show specific error messages
      if (error.message.includes('user rejected')) {
        setRegisterStatus('❌ You rejected the transaction in MetaMask');
      } else if (error.message.includes('already registered')) {
        setRegisterStatus('❌ This content is already registered!');
      } else {
        setRegisterStatus(`❌ Error: ${error.message}`);
      }
      
    } finally {
      setIsRegistering(false);
    }
  };

  
  // ========== VERIFY FUNCTION ==========
  
  /**
   * Verify if content exists on the blockchain
   * This is called when user clicks "Verify Content"
   */
  const handleVerify = async (e) => {
    e.preventDefault();

    // Validation
    if (!isConnected) {
      setVerifyResult({ error: 'Please connect your wallet first' });
      return;
    }

    if (!contract) {
      setVerifyResult({ error: 'Contract not initialized' });
      return;
    }

    if (!verifyHash.trim()) {
      setVerifyResult({ error: 'Please enter a content hash to verify' });
      return;
    }

    try {
      setIsVerifying(true);
      setVerifyResult(null);

      // Call the smart contract to verify
      const [exists, author, timestamp, promptIPFS] = await contract.verifyContent(
        verifyHash
      );

      if (exists) {
        // Content found! Format results nicely
        const date = new Date(Number(timestamp) * 1000).toLocaleString();
        const shortAddress = `${author.substring(0, 6)}...${author.substring(38)}`;
        
        setVerifyResult({
          exists: true,
          author: shortAddress,
          fullAuthor: author,
          timestamp: date,
          timestampUnix: timestamp.toString(),
          promptIPFS,
        });
      } else {
        // Content not found
        setVerifyResult({ exists: false });
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      
      if (error.message.includes('invalid input')) {
        setVerifyResult({ error: 'Invalid hash format. Must be 0x... hex string' });
      } else if (error.message.includes('not found')) {
        setVerifyResult({ error: 'Content not found in registry' });
      } else {
        setVerifyResult({ error: error.message || 'Verification failed' });
      }
      
    } finally {
      setIsVerifying(false);
    }
  };

  
  // ========== UI RENDERING ==========
  
  return (
    <div className="app-container">
      
      {/* ========== HEADER ========== */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>🔐 Proof of Prompt</h1>
            <p>Blockchain-verified AI content authenticity</p>
          </div>
          <button
            className={`connect-btn ${isConnected ? 'connected' : ''}`}
            onClick={isConnected ? handleDisconnect : handleConnect}
          >
            {isConnected 
              ? `${account?.substring(0, 6)}...${account?.substring(38)}` 
              : 'Connect MetaMask'
            }
          </button>
        </div>
        {stats.total > 0 && (
          <div className="stats-bar">
            📊 {stats.total} pieces of content registered on blockchain
          </div>
        )}
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <main className="main-content">
        
        {/* ========== TAB BUTTONS ========== */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            📝 Register
          </button>
          <button
            className={`tab-btn ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            ✅ Verify
          </button>
        </div>

        {/* ========== REGISTER TAB ========== */}
        {activeTab === 'register' && (
          <div className="tab-content">
            <h2>Register Your Content</h2>
            <p className="tab-description">
              Register AI-generated content to prove you created it first. 
              Your hash will be permanently stored on the blockchain.
            </p>
            
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="prompt">
                  Original Prompt
                  <span className="required">*</span>
                </label>
                <textarea
                  id="prompt"
                  placeholder="Enter the exact prompt you gave to the AI (e.g., 'Write a poem about cats')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={!isConnected || isRegistering}
                  rows="4"
                />
                <small>{prompt.length} characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="output">
                  AI Output
                  <span className="required">*</span>
                </label>
                <textarea
                  id="output"
                  placeholder="Paste the complete AI-generated response you want to register"
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  disabled={!isConnected || isRegistering}
                  rows="4"
                />
                <small>{output.length} characters</small>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={!isConnected || isRegistering || !prompt.trim() || !output.trim()}
              >
                {isRegistering 
                  ? '⏳ Registering on blockchain...' 
                  : '🚀 Register Content'
                }
              </button>
            </form>

            {registerStatus && (
              <div className={`status-message ${
                registerStatus.includes('✅') ? 'success' : 
                registerStatus.includes('⏳') ? 'pending' :
                'error'
              }`}>
                <p>{registerStatus}</p>
              </div>
            )}

            {!isConnected && (
              <div className="info-box">
                ℹ️ Connect your MetaMask wallet above to register content
              </div>
            )}
          </div>
        )}

        {/* ========== VERIFY TAB ========== */}
        {activeTab === 'verify' && (
          <div className="tab-content">
            <h2>Verify Content</h2>
            <p className="tab-description">
              Enter a content hash to verify if it was registered on the blockchain 
              and see who registered it and when.
            </p>
            
            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label htmlFor="hash">
                  Content Hash
                  <span className="required">*</span>
                </label>
                <textarea
                  id="hash"
                  placeholder="Paste the content hash here (starts with 0x and is 66 characters long)"
                  value={verifyHash}
                  onChange={(e) => setVerifyHash(e.target.value)}
                  disabled={!isConnected || isVerifying}
                  rows="3"
                />
                <small>Hash must be 66 characters (0x + 64 hex digits)</small>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={!isConnected || isVerifying || !verifyHash.trim()}
              >
                {isVerifying ? '⏳ Verifying...' : '🔍 Verify Content'}
              </button>
            </form>

            {verifyResult && (
              <div className={`verify-result ${
                verifyResult.error ? 'error' : 
                verifyResult.exists ? 'verified' : 
                'not-found'
              }`}>
                {verifyResult.error && (
                  <>
                    <h3>❌ Error</h3>
                    <p className="error-text">{verifyResult.error}</p>
                  </>
                )}
                
                {verifyResult.exists && (
                  <>
                    <h3>✅ Content Verified!</h3>
                    <div className="verification-details">
                      <div className="detail-row">
                        <strong>Status:</strong>
                        <span className="status-badge">REGISTERED</span>
                      </div>
                      <div className="detail-row">
                        <strong>Registered By:</strong>
                        <code>{verifyResult.author}</code>
                      </div>
                      <div className="detail-row">
                        <strong>Full Address:</strong>
                        <code className="full-address">{verifyResult.fullAuthor}</code>
                      </div>
                      <div className="detail-row">
                        <strong>Registered On:</strong>
                        <span>{verifyResult.timestamp}</span>
                      </div>
                      <div className="detail-row">
                        <strong>Timestamp (Unix):</strong>
                        <code>{verifyResult.timestampUnix}</code>
                      </div>
                      {verifyResult.promptIPFS && verifyResult.promptIPFS.trim() && (
                        <div className="detail-row">
                          <strong>IPFS Hash:</strong>
                          <code>{verifyResult.promptIPFS}</code>
                        </div>
                      )}
                    </div>
                    <p className="success-message">
                      This content has been permanently recorded on the Sepolia blockchain 
                      and cannot be modified or deleted.
                    </p>
                  </>
                )}
                
                {!verifyResult.exists && !verifyResult.error && (
                  <>
                    <h3>❌ Content Not Found</h3>
                    <p className="error-text">
                      This hash is not registered in the Proof of Prompt registry. 
                      Either the content hasn't been registered yet, or the hash is incorrect.
                    </p>
                    <div className="tips">
                      <strong>💡 Tips:</strong>
                      <ul>
                        <li>Make sure you copied the full hash (0x followed by 64 hex characters)</li>
                        <li>The hash is case-insensitive but must be exact</li>
                        <li>Check that content was registered on the same network (Sepolia)</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}

            {!isConnected && (
              <div className="info-box">
                ℹ️ Connect your MetaMask wallet above to verify content
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="footer">
        <div className="footer-content">
          <p>
            🌐 <strong>Proof of Prompt</strong> | Built on Sepolia Testnet | 
            <a href="https://sepolia.etherscan.io" target="_blank" rel="noopener noreferrer">
              View on Etherscan
            </a>
          </p>
          <p className="contract-info">
            Contract: <code>{CONTRACT_ADDRESS?.substring(0, 10)}...</code>
          </p>
          <p className="disclaimer">
            This is a proof-of-concept for blockchain-based content verification. 
            Use at your own discretion.
          </p>
        </div>
      </footer>
    </div>
  );
}
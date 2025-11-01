# Proof of Prompt (Blockchain Project)

## 🔗 **Overview**

Proof of Prompt is a decentralized application (dApp) built with **Hardhat**, **Vite**, and **MetaMask**, enabling users to store and verify AI-generated prompts on the **Ethereum blockchain**.  
This ensures transparency and immutability — every prompt submitted is recorded permanently on-chain.

---

## 🧠 Features

- 📝 Store prompts securely on the blockchain  
- 🔍 Retrieve and view all previously stored prompts  
- 💡 Transparent proof-of-creation using smart contracts  
- 💰 Works with MetaMask and local Hardhat network  

---

## ⚙️ Tech Stack

| Layer | Tools / Libraries |
|-------|-------------------|
| Smart Contracts | Solidity, Hardhat |
| Frontend | React + Vite |
| Blockchain Interaction | Ethers.js |
| Wallet Integration | MetaMask |
| Environment Config | dotenv (.env.local) |

---

## 📁 Project Structure
├── contracts/
│ └── ProofOfPrompt.sol
├── scripts/
│ └── deploy.js
├── frontend/
│ ├── src/
│ │ └── App.jsx
│ └── .env.local
├── hardhat.config.js
├── package.json
└── README.md

yaml
Copy code

---

## ⚡ **Setup and Installation**

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/proof-of-prompt.git
cd proof-of-prompt
```
### 2️⃣ Install dependencies
Copy code
```bash
npm install
```
### 3️⃣ Start Hardhat local blockchain
Copy code
```bash
npx hardhat node
```
### 4️⃣ Deploy the contract
Open another terminal and run:
Copy code
```bash
npx hardhat run --network localhost scripts/deploy.js
```
After successful deployment, you’ll see:
css
Copy code
Contract deployed to: 0xYourNewAddress
### 5️⃣ Update .env.local
Go to your frontend directory and update:

ini
Copy code
VITE_CONTRACT_ADDRESS=0xYourNewAddress
🧩 Running the Frontend
bash
Copy code
npm run dev
🦊 MetaMask Part
Install the MetaMask extension from your browser and go to this link:
extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#

Go to MetaMask account settings.
Import your local blockchain account into MetaMask using the Private key.
(Private key is given out when you create local blockchain using npx hardhat node.)

Now open:
👉 http://localhost:5173

🪙 Connect MetaMask → Select Localhost 8545 Network → Interact with your App
Custom Network Setup (MetaMask)
To connect MetaMask with Hardhat local blockchain:

```Field	Value
Network Name	Hardhat Local
RPC URL	http://127.0.0.1:8545
Chain ID	31337
Currency Symbol	ETH
Block Explorer URL	(Leave Empty)
```

## Example Commands
### Compile contracts:
In Terminal 1:
bash (Be in pques directory)
```
npx hardhat compile
```
### Deploy to network:
In Terminal 2:
Copy code
bash (Be in pques directory)
```
npx hardhat run scripts/deploy.js --network localhost
```
### Run frontend:
In Terminal 3:
bash (Be in frontend directory)
```
npm run dev
```
Open your local host web and start working with the web app 🚀

### Interact via Hardhat console:
bash
Copy code
npx hardhat console --network localhost
##  Working
### You can hash a prompt and its answer in a block, and then verify the block with the help of its hash in the verify section.
Admin access to get complete prompt details (coming soon).

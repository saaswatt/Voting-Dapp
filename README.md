# Voting DApp – Secure, Single-Election Smart Contract Architecture
### **Project Overview**
* This project is a decentralized voting application (DApp) built using Ethereum smart contracts, Hardhat, React (Vite), and MetaMask.
It is designed with a security-first, immutable architecture, where each election is represented by a separate smart contract deployment.
* The system deliberately avoids contract reuse or state resets to ensure:
    - Clean election boundaries
    - Strong auditability
    - No vote or identity leakage
    - Realistic blockchain behavior
### **Core Design Philosophy:**
> **One smart contract = One election**  
> **New election = New contract deployment**
* Once the election ends:
    - The contract becomes immutable
    - Results are permanently stored on-chain
    - A new election requires deploying a fresh contract
* This mirrors real-world blockchain governance systems.
### **High-Level Architecture**
### Components:
1. **Smart Contract (Solidity):**
    - Controls election lifecycle
    - Enforces admin authority on-chain
    - Handles registration, voting, and result storage
2. **Backend (Hardhat):**
    - Used only for contract deployment
    - Runs on a persistent local blockchain (localhost)
    - Never accessed directly by the frontend
3. **Frontend (React+Vite):**
    - Connects to MetaMask
    - Interacts with deployed contracts
    - Dynamically switches between elections using contract addresses
4. **Wallet (MetaMask):**
    - Provides identity
    - Signs transactions
    - Determines admin authority via msg.sender

### **Security Model**
- **Admin Security:**
    - The admin is the wallet that deploys the contract
    - Admin privileges are enforced on-chain
    - UI visibility does not grant permissions
- **Voter Identity Protection:**
    - Voter Identity Protection
    - Voters register using a hashed identity
    - Identity hash includes:
        - Registration number
        - Name
        - Event-specific salt (eventSalt)
    - Prevents identity reuse across elections
### **Voter Lifecycle:**
1. **Deploy New Election:**
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```
   - Deploys a new VotingElection contract
   - Prints a new contract address
   - Deployer wallet becomes admin
2. **Activate Election:**
    - Admin pastes deployed contract address into the UI
    - Frontend switches context to this address
    - Election state starts as Created
3. **Admin Actions:**
    - Add candidates
    - Start registration phase
    - Start voting phase
    - End election
4. **Voter Actions:**
    - Register during registration phase
    - Vote during voting phase
    - View results after election ends
5. **End Election:**
    - Election state becomes Ended
    - Contract becomes read-only forever
    - Results remain permanently accessible
6. **Start New Election:**
    - Repeat deployment process:
    ```bash
    npx hardhat run scripts/deploy.js    
    ```
    - **Paste new address → new election begins**
    - **Old election remains untouched.**

### Project Structure
```css
voting_dapp/
│
├── contracts/
│   └── VotingElection.sol
│
├── scripts/
│   └── deploy.js
│
├── voting_dapp_frontend/
│   └── src/
│       ├── components/
│       │   ├── AdminPanel.jsx
│       │   ├── VoterPanel.jsx
│       │   └── WalletConnect.jsx
│       │
│       ├── context/
│       │   └── ElectionContext.jsx
│       │
│       ├── hooks/
│       │   └── useWallet.js
│       │
│       ├── contract/
│       │   ├── abi.json
│       │   └── config.js
│       │
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
```

### Common Pitfalls (Avoided by Design):
| Issue              | How it’s prevented        |
| ------------------ | ------------------------- |
| Vote leakage       | New contract per election |
| Identity reuse     | Event-specific salt       |
| Admin spoofing     | `msg.sender` enforcement  |
| Phantom contracts  | Persistent Hardhat node   |
| UI authority abuse | On-chain validation       |
| State reset bugs   | No reset logic            |

### Why This Architecture Was Chosen
- Matches real blockchain governance systems
- Easier to audit and reason about
- Avoids dangerous state reuse
- Clean separation of concerns
- Strong interview / evaluation justification


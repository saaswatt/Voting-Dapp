import { ethers } from "ethers";
import abi from "../contract/abi.json";
import { CONTRACT_ADDRESS } from "../contract/config";

// Allowed networks (Hardhat + Sepolia)
const ALLOWED_CHAIN_IDS = [31337, 11155111];

export async function getContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork();

  if (!ALLOWED_CHAIN_IDS.includes(network.chainId)) {
    throw new Error(
      "Please connect MetaMask to Hardhat (31337) or Sepolia (11155111)"
    );
  }

  const signer = provider.getSigner();

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    abi,
    signer
  );
}

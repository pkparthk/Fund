import Web3 from "web3";

export const loadContract = async (name, provider) => {
  try {
    // Fetch the contract artifact
    const res = await fetch(`/contracts/${name}.json`);
    const Artifact = await res.json();

    // Initialize web3 instance with the provider (e.g., MetaMask)
    const web3 = new Web3(provider);

    // Get the network ID from the provider
    const networkId = await web3.eth.net.getId();
    console.log("Network ID:", networkId);

    // Check if the contract is deployed on the current network
    const deployedNetwork = Artifact.networks[networkId];
    if (!deployedNetwork) {
      throw new Error(`Contract not deployed on network with ID ${networkId}`);
    }

    // Log the deployed contract address
    console.log("Contract deployed at address:", deployedNetwork.address);

    // Create a contract instance with the ABI and the address for the network
    const contractInstance = new web3.eth.Contract(
      Artifact.abi, // ABI from the JSON file
      deployedNetwork.address // Contract address for the network
    );

    return contractInstance;
  } catch (error) {
    console.error(`Failed to load contract ${name}:`, error);
    throw error;
  }
};

import { useState, useEffect } from "react";
import Web3 from "web3";
import "./App.css";
import detectEthereumProvider from "@metamask/detect-provider";
import { loadContract } from "./utils/load_contract";

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
  });

  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [relod, shouldRelod] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState(""); // State for withdrawal input

  const relodEffect = () => shouldRelod(!relod);

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const contract = await loadContract("Funder", provider);
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract, // Ensure the contract instance is correctly assigned
        });
      } else {
        console.error("Please install MetaMask!");
      }

      // let provider = null;
      // if (window.ethereum) {
      //   provider = window.ethereum;
      //   try {
      //     await provider.enable();
      //     // await provider.request({ method: "eth_requestAccounts" });
      //   }
      //   catch (error) {
      //     console.error("User denied account access");
      //   }
      // }
      // else if (window.web3) {
      //   provider = window.web3.currentProvider;
      // }
      // else if (!process.env.production) {
      //   provider = new Web3.providers.HttpProvider("http://localhost:7545");
      // }

      // setWeb3Api({
      //   provider,
      //   web3: new Web3(provider)
      // });
    };
    loadProvider();
  }, []);

  useEffect(() => {
    const loadBalance = async () => {
      if (!web3Api.contract || !web3Api.web3) {
        console.error("Contract or Web3 is undefined");
        return;
      }

      try {
        const { contract, web3 } = web3Api;
        const balance = await web3.eth.getBalance(contract.options.address);
        setBalance(web3.utils.fromWei(balance, "ether"));
      } catch (error) {
        console.error("Failed to load contract balance:", error);
      }
    };

    if (web3Api.web3 && web3Api.contract) {
      loadBalance();
    }
  }, [web3Api, relod]);

  const transferFund = async () => {
    const { web3, contract } = web3Api;

    try {
      const valueToTransfer = web3.utils.toWei("2", "ether"); // Amount to send

      console.log(`Transferring ${valueToTransfer} wei from ${account}`);

      const transaction = await contract.methods.transfer().send({
        from: account,
        value: valueToTransfer,
        gas: 3000000,
      });

      console.log("Transfer successful:", transaction);
    } catch (error) {
      console.error("Failed to transfer funds:", error);
      alert(`Error: ${error.message}`);
    }
    relodEffect();
  };

  const withdrawFund = async () => {
    const { contract, web3 } = web3Api;

    // Convert the withdrawal amount from ETH to Wei
    const withdrawAmountInWei = web3.utils.toWei(withdrawAmount, "ether");

    // Check if the amount is valid (not greater than 2 ether and not zero)
    if (parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > 2) {
      alert(
        "You can only withdraw an amount greater than 0 ETH and less than or equal to 2 ETH"
      );
      return;
    }

    try {
      const transaction = await contract.methods
        .withdraw(withdrawAmountInWei)
        .send({
          from: account,
          gas: 3000000,
        });
      console.log("Withdraw successful:", transaction);
      setWithdrawAmount(""); // Clear the input after withdrawal
      // Reload balance after withdrawal
      const updatedBalance = await web3.eth.getBalance(
        contract.options.address
      );
      setBalance(web3.utils.fromWei(updatedBalance, "ether"));
    } catch (error) {
      console.error("Failed to withdraw funds:", error);
      alert(`Error: ${error.message}`);
    }
    relodEffect();
  };


  useEffect(() => {
    const getAccount = async () => {
      try {
        const accounts = await web3Api.web3.eth.getAccounts();
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Failed to load accounts:", error);
      }
    };
    if (web3Api.web3) {
      getAccount();
    }
  }, [web3Api.web3]);
  // console.log(web3Api.web3);

  return (
    <>
      <div class="card text-center">
        <div class="card-header">Funding</div>
        <div class="card-body">
          <h5 class="card-title">
            Balance: {balance ? `${balance} ETH` : "Loading..."}
          </h5>
          <p class="card-text">
            Account : {account ? account : "Not connected"}
          </p>
          {/* <button
              type="button"
              class="btn btn-success"
              onClick={async () => {
                const accounts = await window.ethereum.request({
                  method: "eth_requestAccounts",
                });
                console.log(accounts);
              }}>
              Connect to metamask
            </button> */}
          &nbsp;
          <button type="button" class="btn btn-success " onClick={transferFund}>
            Transfer
          </button>
          &nbsp;
          <input
            type="number"
            placeholder="Amount to withdraw (ETH)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)} // Update state on change
          />
          <button type="button" class="btn btn-primary" onClick={withdrawFund}>
            Withdraw
          </button>
        </div>
        <div class="card-footer text-muted">Parth Kothari</div>
      </div>
    </>
  );
}

export default App;

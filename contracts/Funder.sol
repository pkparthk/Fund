// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Funder {
    uint256 public numOfFunders;
    mapping(uint256 => address) private funders;
    

    receive() external payable {}

    function transfer() external payable {
        require(msg.value > 0, "Transfer amount must be greater than 0");
        funders[numOfFunders] = msg.sender;
        numOfFunders++;
    }

    function withdraw(uint256 withdrawAmount) external {
        require(
            withdrawAmount <= 2 ether,
            "Cannot withdraw more than 2 ether"
        );
        payable(msg.sender).transfer(withdrawAmount);
    }
}

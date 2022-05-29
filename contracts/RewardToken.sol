// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


error Reward__MintFailed();

contract RewardToken is ERC20 {
    constructor() ERC20 ("Reward Token", "ART") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(address _account, uint256 _amount) public {
        if(_amount <= 0) {
            revert Reward__MintFailed();
        }
        _mint(_account, _amount);
    }
}
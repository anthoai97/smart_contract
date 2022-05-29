// stake: Lock the tokens into our smart contract ✅
// withdraw (unstake): unlock tokens and pull out of the contract ✅
// claimReward: users get their reward tokens

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error Staking__TransferFailed();
error Staking__NeedMoreThanZero();

contract Staking is ReentrancyGuard {
    IERC20 public s_stakingToken;
    IERC20 public s_rewardToken;

    // address -> how much they staked
    mapping(address => uint256) public s_balances;

    // address -> how much each address has been paid
    mapping(address => uint256) public s_userRewardPerTokenPaid;

    // address -> how much each address has reward
    mapping(address => uint256) public s_rewards;

    uint256 public REWARD_RATE = 100;
    uint256 public s_totalSupply;
    uint256 public s_rewardPerTokenStored;
    uint256 public s_lastUpdateTime;

    event Staked(address indexed user, uint256 indexed amount);
    event WithdrewStake(address indexed user, uint256 indexed amount);
    event RewardsClaimed(address indexed user, uint256 indexed amount);

    modifier updateReward(address _account) {
        // How much reward per token ?
        // last timestamp
        s_rewardPerTokenStored = rewardPerToken();
        s_lastUpdateTime = block.timestamp;
        // Carculate and update the reward earned
        s_rewards[_account] = earned(_account);
        // Update PerToken Paid
        s_userRewardPerTokenPaid[_account] = s_rewardPerTokenStored;
        _;
    }

    modifier moreThanZero(uint256 _amount) {
        if (_amount == 0) {
            revert Staking__NeedMoreThanZero();
        }
        _;
    }

    constructor(address _stakingToken, address _rewardToken) {
        // Import that IERC20 token from contructor ✅
        s_stakingToken = IERC20(_stakingToken);
        s_rewardToken = IERC20(_rewardToken);
    }

    function earned(address _account) public view returns (uint256) {
        uint256 currentBalance = s_balances[_account];
        // How much the have been paid already in last update function call
        uint256 amountPaid = s_userRewardPerTokenPaid[_account];
        uint256 currentRewardPerToken = rewardPerToken();
        uint256 pastReward = s_rewards[_account];
        // Example: 1s -> 2s -> 3s
        // currentRewardPerToken is reward from 1s -> 3s
        // amountPaid is reward from 1s -> 2s was paid in las update function call
        // So (currentRewardPerToken - amountPaid) to get reward from 2s -> 3s
        // + pastReward to get total reward this _account earned.
        return ((currentBalance * (currentRewardPerToken - amountPaid)) / 1e18) + pastReward;
    }

    // Based on how long it's been during this most recent snapshot
    function rewardPerToken() public view returns (uint256) {
        if (s_totalSupply == 0) {
            return s_rewardPerTokenStored;
        }

        // ((block.timestamp - s_lastUpdateTime) * REWARD_RATE * 1e18) total reward gain after (n) second timestamp updated
        return
            s_rewardPerTokenStored +
            (((block.timestamp - s_lastUpdateTime) * REWARD_RATE * 1e18) / s_totalSupply);
    }

    // Do we allow any tokens? - Not allow any token.
    //      Chainlink stuff to convert prices between tokens.
    // or just a specific token for this contract ✅
    function stake(uint256 _amount)
        external
        updateReward(msg.sender)
        nonReentrant
        moreThanZero(_amount)
    {
        // keep track of how much this user has staked
        // keep track of how much token we have total
        // transfer the tokens to this contract
        s_balances[msg.sender] += _amount;
        s_totalSupply += _amount;
        emit Staked(msg.sender, _amount);
        bool success = s_stakingToken.transferFrom(msg.sender, address(this), _amount);
        // required(success, "Failed");
        // Use revert with custom error define save gas more than "string" ✅
        if (!success) {
            // Ensure all state changes happen before calling external contract to care of the "Re-Entrancy Attack"
            revert Staking__TransferFailed();
        }
    }

    function withDraw(uint256 _amount) external updateReward(msg.sender) nonReentrant {
        s_balances[msg.sender] -= _amount;
        s_totalSupply -= _amount;
        emit WithdrewStake(msg.sender, _amount);
        bool success = s_stakingToken.transfer(msg.sender, _amount);
        if (!success) {
            revert Staking__TransferFailed();
        }
    }

    function claimReward() external updateReward(msg.sender) nonReentrant {
        // How much reward do they get?
        uint256 reward = s_rewards[msg.sender];
        s_rewards[msg.sender] = 0;
        emit RewardsClaimed(msg.sender, reward);
        bool success = s_rewardToken.transfer(msg.sender, reward);
        if (!success) {
            revert Staking__TransferFailed();
        }
        // The contract is going to emit X tokens per second
        // And disperse them to all the stakers
        //
        // 100 tokens / second
        // staked: 50 staked tokens, 20 staked tokens, 30 staked tokens
        // rewards : 50 reward tokens, 20 reward tokens, 30 reward tokens
        //
        // staked: 100, 50, 20, 30 (total = 200)
        // rewards: 50, 25, 10, 15
        //
        // Why not 1 to 1? - brankupt your protocal
    }

    function getStaked(address _account) public view returns(uint256) {
        return s_balances[_account];
    }
}

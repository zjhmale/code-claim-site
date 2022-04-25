// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

contract Vesting is Ownable {
    uint256 public totalReleased;

    mapping(address => uint256) public shares;
    mapping(address => uint256) public released;
    address[] public payees;

    IERC20 public immutable codeToken;

    uint256 public immutable start;
    uint256 public immutable duration = 2 * 365 days; // total 2 years vesting period
    uint256 public immutable releasePeriod = 30 days; // release every month
    uint256 public immutable totalEpochs = 24; // total release epochs will be 24 months
    uint256 public immutable totalShares = 690_000 * 1e18; // The Founding Team will retain 6%, current Advisors will retain 0.9%

    constructor(
        address[] memory _payees,
        uint256[] memory _shares,
        address _codeToken,
        uint256 _startTimestamp
    ) {
        require(_payees.length == _shares.length, "PaymentSplitter: payees and shares length mismatch");
        require(_payees.length > 0, "PaymentSplitter: no payees");

        uint256 _totalShares = 0;
        for (uint256 i = 0; i < _payees.length; i++) {
            _addPayee(_payees[i], _shares[i]);
            _totalShares += _shares[i];
        }

        require(_totalShares == totalShares, "TotalShares mismatch");

        codeToken = IERC20(_codeToken);
        start = _startTimestamp;
    }

    function release() public virtual {
        address account = _msgSender();
        require(shares[account] > 0, "PaymentSplitter: account has no shares");
        uint256 releasable = vestedAmount(account);
        require(releasable > 0, "PaymentSplitter: account is not due payment");

        released[account] += releasable;
        totalReleased += releasable;

        codeToken.transfer(account, releasable);
    }

    function vestedAmount(address _account) public view returns (uint256) {
        uint256 timestamp = block.timestamp;
        if (timestamp < start) {
            return 0;
        } else if (timestamp > start + duration) {
            return shares[_account] - released[_account];
        } else {
            uint256 _epoch = epoch(timestamp - start);
            return (shares[_account] * _epoch) / totalEpochs - released[_account];
        }
    }

    function _addPayee(address _account, uint256 _shares) private {
        require(_account != address(0), "PaymentSplitter: account is the zero address");
        require(_shares > 0, "PaymentSplitter: shares are 0");
        require(shares[_account] == 0, "PaymentSplitter: account already has shares");

        payees.push(_account);
        shares[_account] = _shares;
    }

    function epoch(uint256 period) public pure returns (uint256) {
        uint256 b = 30 days;
        uint256 m = period % b;
        return (period - m) / b;
    }
}

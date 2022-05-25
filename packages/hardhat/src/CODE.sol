//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract CODE is ERC20, ERC20Permit, AccessControl, ERC20Burnable {
    bytes32 public constant SWEEP_ROLE = keccak256("SWEEP_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    event Sweep20(address _token, address _to);
    event Sweep721(address _token, address _to, uint256 _tokenID);

    constructor(address _treasury) ERC20("Developer DAO", "CODE") ERC20Permit("Developer DAO") {
        _setupRole(DEFAULT_ADMIN_ROLE, _treasury);
        _mint(_msgSender(), 10_000_000 * 1e18);
    }

    function mint(address _to, uint256 _amount) external onlyRole(MINTER_ROLE) {
        _mint(_to, _amount);
    }

    function sweep20(address _tokenAddr, address _to) external onlyRole(SWEEP_ROLE) {
        IERC20 token = IERC20(_tokenAddr);
        token.transfer(_to, token.balanceOf(address(this)));
        emit Sweep20(_tokenAddr, _to);
    }

    function sweep721(
        address _tokenAddr,
        address _to,
        uint256 _tokenID
    ) external onlyRole(SWEEP_ROLE) {
        IERC721 token = IERC721(_tokenAddr);
        token.transferFrom(address(this), _to, _tokenID);
        emit Sweep721(_tokenAddr, _to, _tokenID);
    }
}

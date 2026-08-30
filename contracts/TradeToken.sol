// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TradeToken is ERC20, ERC20Permit, ERC20Burnable, Ownable {
    uint8 private constant TOKEN_DECIMALS = 18;

    constructor(
        address initialOwner,
        uint256 initialSupply
    )
        ERC20("TredDEX Token", "TRADE")
        ERC20Permit("TredDEX Token")
        Ownable(initialOwner)
    {
        _mint(initialOwner, initialSupply);
    }

    function decimals()
        public
        pure
        override
        returns (uint8)
    {
        return TOKEN_DECIMALS;
    }

    function mint(
        address to,
        uint256 amount
    ) external onlyOwner {
        _mint(to, amount);
    }
}

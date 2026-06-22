// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Local/fallback cUSD used only for tests and blocked testnet demos.
contract MockCUSD is ERC20 {
    constructor() ERC20("Mock Mento cUSD", "cUSD") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

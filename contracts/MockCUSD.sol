// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockCUSD
/// @notice Mintable cUSD-compatible ERC20 used for tests and the testnet end-to-end demo.
/// @dev On Celo mainnet the production token is Mento USDm. This mock exists because the
///      Celo Sepolia deployer holds 0 real USDm and there is no faucet, so a freely mintable
///      cUSD stand-in is deployed for the on-chain demo flow.
contract MockCUSD is ERC20 {
    constructor() ERC20("Celo Dollar (Test)", "cUSD") {}

    /// @notice Mints `amount` cUSD to `to`. Open for testing convenience.
    /// @param to Recipient of the minted tokens.
    /// @param amount Amount to mint (base units, 18 decimals).
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

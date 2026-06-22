// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {StreamWageVault} from "../contracts/StreamWageVault.sol";
import {MockCUSD} from "../contracts/MockCUSD.sol";

/// @title DeployStreamWage
/// @notice Deploys StreamWageVault on Celo Sepolia.
/// @dev If `CUSD_ADDRESS` is set in the environment, that token is used as cUSD. Otherwise a
///      fresh mintable `MockCUSD` is deployed and 1,000,000 cUSD is minted to the deployer so the
///      testnet end-to-end flow can run (the deployer holds 0 real USDm and there is no faucet).
///      On Celo mainnet the production token is Mento USDm at the address below.
contract DeployStreamWage is Script {
    /// @notice Production Mento USDm (cUSD) token on Celo mainnet — kept for reference.
    address internal constant CELO_MAINNET_USDM = 0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b;

    /// @notice cUSD minted to the deployer when a fresh MockCUSD is deployed.
    uint256 internal constant SEED_MINT = 1_000_000 ether;

    function run() external returns (StreamWageVault vault, address cUSD) {
        uint256 deployerKey = vm.envUint("CELO_DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        address configuredCusd = vm.envOr("CUSD_ADDRESS", address(0));

        vm.startBroadcast(deployerKey);

        if (configuredCusd != address(0)) {
            cUSD = configuredCusd;
            console2.log("Using configured cUSD:", cUSD);
        } else {
            MockCUSD mock = new MockCUSD();
            mock.mint(deployer, SEED_MINT);
            cUSD = address(mock);
            console2.log("Deployed MockCUSD:", cUSD);
            console2.log("Minted cUSD to deployer:", SEED_MINT);
        }

        vault = new StreamWageVault(IERC20(cUSD), deployer);

        vm.stopBroadcast();

        console2.log("Deployer:", deployer);
        console2.log("StreamWageVault:", address(vault));
        console2.log("cUSD token:", cUSD);
        console2.log("Mainnet USDm reference:", CELO_MAINNET_USDM);
    }
}

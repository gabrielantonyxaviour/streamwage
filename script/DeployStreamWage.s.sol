// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {StreamWageVault} from "../contracts/StreamWageVault.sol";

contract DeployStreamWage is Script {
    // Mento StableTokenUSD on Celo Sepolia, from Mento deployments docs.
    address internal constant CELO_SEPOLIA_CUSD = 0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b;

    function run() external returns (StreamWageVault vault) {
        uint256 deployerKey = vm.envUint("CELO_DEPLOYER_PRIVATE_KEY");
        address owner = vm.addr(deployerKey);
        address cUSD = vm.envOr("CUSD_ADDRESS", CELO_SEPOLIA_CUSD);

        vm.startBroadcast(deployerKey);
        vault = new StreamWageVault(IERC20(cUSD), owner);
        vm.stopBroadcast();
    }
}

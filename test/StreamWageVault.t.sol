// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MockCUSD} from "../contracts/MockCUSD.sol";
import {StreamWageVault} from "../contracts/StreamWageVault.sol";

contract StreamWageVaultTest is Test {
    MockCUSD internal cUSD;
    StreamWageVault internal vault;

    address internal owner = address(0xA11CE);
    address internal worker = address(0xBEEF);

    function setUp() public {
        cUSD = new MockCUSD();
        vault = new StreamWageVault(cUSD, owner);
        cUSD.mint(owner, 15_000 ether);
        vm.prank(owner);
        cUSD.approve(address(vault), type(uint256).max);
    }

    function testFundPayrollPullsCusdFromOwner() public {
        vm.prank(owner);
        vault.fundPayroll(10_000 ether);

        assertEq(vault.payrollLiquidity(), 10_000 ether);
        assertEq(cUSD.balanceOf(address(vault)), 10_000 ether);
    }

    function testCreateStreamRequiresSelfVerifiedWorker() public {
        vm.prank(owner);
        vm.expectRevert(StreamWageVault.WorkerNotVerified.selector);
        vault.createStream(worker, 1 ether);

        vm.prank(owner);
        vault.setWorkerVerification(worker, true);

        vm.prank(owner);
        uint256 streamId = vault.createStream(worker, 1 ether);

        (address recordedWorker, uint256 ratePerSecond,,,, bool exists) = vault.streams(streamId);
        assertEq(recordedWorker, worker);
        assertEq(ratePerSecond, 1 ether);
        assertTrue(exists);
    }

    function testWorkerWithdrawsStreamedCusd() public {
        vm.startPrank(owner);
        vault.fundPayroll(10_000 ether);
        vault.setWorkerVerification(worker, true);
        uint256 streamId = vault.createStream(worker, 1 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + 30);
        vm.prank(worker);
        uint256 paid = vault.withdrawAccrued(streamId);

        assertEq(paid, 30 ether);
        assertEq(cUSD.balanceOf(worker), 30 ether);
        assertEq(vault.payrollLiquidity(), 9_970 ether);
    }

    function testPauseStopsAccrualUntilResume() public {
        vm.startPrank(owner);
        vault.setWorkerVerification(worker, true);
        uint256 streamId = vault.createStream(worker, 1 ether);

        vm.warp(block.timestamp + 10);
        vault.pauseStream(streamId);
        vm.warp(block.timestamp + 30);
        assertEq(vault.pending(streamId), 10 ether);

        vault.resumeStream(streamId);
        vm.stopPrank();

        vm.warp(block.timestamp + 5);
        assertEq(vault.pending(streamId), 15 ether);
    }

    function testOnlyWorkerCanClaim() public {
        vm.startPrank(owner);
        vault.fundPayroll(100 ether);
        vault.setWorkerVerification(worker, true);
        uint256 streamId = vault.createStream(worker, 1 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + 5);
        vm.expectRevert(StreamWageVault.OnlyWorker.selector);
        vault.withdrawAccrued(streamId);
    }
}

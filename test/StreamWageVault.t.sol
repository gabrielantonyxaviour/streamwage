// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MockCUSD} from "../contracts/MockCUSD.sol";
import {StreamWageVault} from "../contracts/StreamWageVault.sol";

contract StreamWageVaultTest is Test {
    MockCUSD internal cUSD;
    StreamWageVault internal vault;

    address internal owner = address(0xA11CE);
    address internal worker = address(0xBEEF);
    address internal stranger = address(0xCAFE);

    function setUp() public {
        cUSD = new MockCUSD();
        vault = new StreamWageVault(cUSD, owner);
        cUSD.mint(owner, 15_000 ether);
        vm.prank(owner);
        cUSD.approve(address(vault), type(uint256).max);
    }

    /// (a) fundPayroll increases payrollReserve + totalFunded and pulls tokens.
    function testFundPayrollPullsCusdAndTracksTotals() public {
        vm.prank(owner);
        vault.fundPayroll(10_000 ether);

        assertEq(vault.payrollReserve(), 10_000 ether);
        assertEq(vault.totalFunded(), 10_000 ether);
        assertEq(cUSD.balanceOf(address(vault)), 10_000 ether);
        assertEq(cUSD.balanceOf(owner), 5_000 ether);

        vm.prank(owner);
        vault.fundPayroll(2_000 ether);
        assertEq(vault.payrollReserve(), 12_000 ether);
        assertEq(vault.totalFunded(), 12_000 ether);
    }

    /// (b) createStream reverts WorkerNotVerified for an unverified payee, succeeds after verification.
    function testCreateStreamRequiresVerifiedWorker() public {
        vm.prank(owner);
        vm.expectRevert(StreamWageVault.WorkerNotVerified.selector);
        vault.createStream(worker, 1 ether);

        vm.prank(owner);
        vault.setWorkerVerification(worker, true);

        vm.prank(owner);
        uint256 streamId = vault.createStream(worker, 1 ether);

        (address payee, uint256 ratePerSecond,,,, bool exists) = vault.streams(streamId);
        assertEq(payee, worker);
        assertEq(ratePerSecond, 1 ether);
        assertTrue(exists);
        assertEq(vault.totalStreamRate(), 1 ether);
        assertEq(vault.nextStreamId(), 1);
    }

    /// (c) accrual: pending() == rate * elapsed after warping forward.
    function testPendingAccruesAtRatePerSecond() public {
        vm.startPrank(owner);
        vault.fundPayroll(10_000 ether);
        vault.setWorkerVerification(worker, true);
        uint256 streamId = vault.createStream(worker, 1 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + 42);
        assertEq(vault.pending(streamId), 42 ether);
    }

    /// (d) withdrawAccrued transfers cUSD, zeroes accrued, decrements reserve; reverts OnlyWorker.
    function testWithdrawAccruedPaysWorkerAndGuardsCaller() public {
        vm.startPrank(owner);
        vault.fundPayroll(10_000 ether);
        vault.setWorkerVerification(worker, true);
        uint256 streamId = vault.createStream(worker, 1 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + 30);

        // Non-payee cannot claim.
        vm.prank(stranger);
        vm.expectRevert(StreamWageVault.OnlyWorker.selector);
        vault.withdrawAccrued(streamId);

        // Payee claims successfully.
        vm.prank(worker);
        uint256 paid = vault.withdrawAccrued(streamId);

        assertEq(paid, 30 ether);
        assertEq(cUSD.balanceOf(worker), 30 ether);
        assertEq(vault.payrollReserve(), 9_970 ether);
        assertEq(vault.totalFunded(), 10_000 ether); // cumulative, unchanged by withdrawals

        (,, uint256 accrued,,,) = vault.streams(streamId);
        assertEq(accrued, 0);
    }

    /// (e) pause stops accrual + reduces totalStreamRate; resume restores both.
    function testPauseResumeAccrualAndTotalRate() public {
        vm.startPrank(owner);
        vault.setWorkerVerification(worker, true);
        uint256 streamId = vault.createStream(worker, 1 ether);
        assertEq(vault.totalStreamRate(), 1 ether);

        vm.warp(block.timestamp + 10);
        vault.pauseStream(streamId);
        assertEq(vault.totalStreamRate(), 0); // rate removed while paused

        vm.warp(block.timestamp + 30);
        assertEq(vault.pending(streamId), 10 ether); // no accrual while paused

        vault.resumeStream(streamId);
        assertEq(vault.totalStreamRate(), 1 ether); // rate restored
        vm.stopPrank();

        vm.warp(block.timestamp + 5);
        assertEq(vault.pending(streamId), 15 ether);
    }

    /// Extra: resume on a non-paused stream reverts NotPaused.
    function testResumeRevertsWhenNotPaused() public {
        vm.startPrank(owner);
        vault.setWorkerVerification(worker, true);
        uint256 streamId = vault.createStream(worker, 1 ether);
        vm.expectRevert(StreamWageVault.NotPaused.selector);
        vault.resumeStream(streamId);
        vm.stopPrank();
    }

    /// Extra: constructor rejects a zero cUSD token address.
    function testConstructorRejectsZeroCusd() public {
        vm.expectRevert(StreamWageVault.ZeroAddress.selector);
        new StreamWageVault(IERC20(address(0)), owner);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title StreamWageVault
/// @notice Payroll vault that streams Celo cUSD wages to Self-verified workers.
contract StreamWageVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Stream {
        address worker;
        uint256 ratePerSecond;
        uint256 accrued;
        uint256 lastUpdated;
        bool paused;
        bool exists;
    }

    IERC20 public immutable cUSD;
    uint256 public payrollLiquidity;
    uint256 public nextStreamId;

    mapping(address => bool) public isVerifiedWorker;
    mapping(uint256 => Stream) public streams;

    event PayrollFunded(uint256 amount, uint256 liquidity);
    event WorkerVerificationSet(address indexed worker, bool verified);
    event StreamCreated(uint256 indexed streamId, address indexed worker, uint256 ratePerSecond);
    event StreamPaused(uint256 indexed streamId);
    event StreamResumed(uint256 indexed streamId);
    event WorkerPaid(uint256 indexed streamId, address indexed worker, uint256 amount);

    error ZeroAddress();
    error ZeroAmount();
    error ZeroRate();
    error WorkerNotVerified();
    error StreamNotFound();
    error NotPaused();
    error OnlyWorker();
    error NoAccrual();
    error InsufficientLiquidity();

    constructor(IERC20 cUSD_, address initialOwner) Ownable(initialOwner) {
        if (address(cUSD_) == address(0) || initialOwner == address(0)) revert ZeroAddress();
        cUSD = cUSD_;
    }

    /// @notice Funds payroll after the employer approves this vault for cUSD.
    function fundPayroll(uint256 amount) external onlyOwner nonReentrant {
        if (amount == 0) revert ZeroAmount();
        payrollLiquidity += amount;
        cUSD.safeTransferFrom(msg.sender, address(this), amount);
        emit PayrollFunded(amount, payrollLiquidity);
    }

    /// @notice Records a Self Protocol verification result for a worker.
    function setWorkerVerification(address worker, bool verified) external onlyOwner {
        if (worker == address(0)) revert ZeroAddress();
        isVerifiedWorker[worker] = verified;
        emit WorkerVerificationSet(worker, verified);
    }

    /// @notice Creates a per-second cUSD wage stream for a verified worker.
    function createStream(address worker, uint256 ratePerSecond)
        external
        onlyOwner
        returns (uint256 streamId)
    {
        if (worker == address(0)) revert ZeroAddress();
        if (ratePerSecond == 0) revert ZeroRate();
        if (!isVerifiedWorker[worker]) revert WorkerNotVerified();

        streamId = nextStreamId++;
        streams[streamId] = Stream({
            worker: worker,
            ratePerSecond: ratePerSecond,
            accrued: 0,
            lastUpdated: block.timestamp,
            paused: false,
            exists: true
        });

        emit StreamCreated(streamId, worker, ratePerSecond);
    }

    function pauseStream(uint256 streamId) external onlyOwner {
        Stream storage stream = _stream(streamId);
        _accrue(stream);
        stream.paused = true;
        emit StreamPaused(streamId);
    }

    function resumeStream(uint256 streamId) external onlyOwner {
        Stream storage stream = _stream(streamId);
        if (!stream.paused) revert NotPaused();
        stream.paused = false;
        stream.lastUpdated = block.timestamp;
        emit StreamResumed(streamId);
    }

    /// @notice Worker pulls currently accrued cUSD into their MiniPay wallet.
    function withdrawAccrued(uint256 streamId) external nonReentrant returns (uint256 amount) {
        Stream storage stream = _stream(streamId);
        if (msg.sender != stream.worker) revert OnlyWorker();
        _accrue(stream);

        amount = stream.accrued;
        if (amount == 0) revert NoAccrual();
        if (payrollLiquidity < amount) revert InsufficientLiquidity();

        payrollLiquidity -= amount;
        stream.accrued = 0;
        cUSD.safeTransfer(stream.worker, amount);
        emit WorkerPaid(streamId, stream.worker, amount);
    }

    function pending(uint256 streamId) external view returns (uint256) {
        Stream storage stream = _stream(streamId);
        if (stream.paused) return stream.accrued;
        return stream.accrued + ((block.timestamp - stream.lastUpdated) * stream.ratePerSecond);
    }

    function _accrue(Stream storage stream) internal {
        if (!stream.paused) {
            stream.accrued += (block.timestamp - stream.lastUpdated) * stream.ratePerSecond;
        }
        stream.lastUpdated = block.timestamp;
    }

    function _stream(uint256 streamId) internal view returns (Stream storage stream) {
        stream = streams[streamId];
        if (!stream.exists) revert StreamNotFound();
    }
}

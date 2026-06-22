// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title StreamWageVault
/// @author StreamWage
/// @notice Payroll vault that streams Celo cUSD wages to Self-verified workers in real time.
/// @dev The employer (owner) funds a shared payroll reserve, verifies workers (mirroring a
///      Self Protocol attestation on-chain), and opens per-second wage streams. Workers pull
///      their accrued cUSD whenever they want — typically from a MiniPay wallet. All wage math
///      uses `ratePerSecond * elapsedSeconds`; balances are denominated in cUSD (18 decimals).
contract StreamWageVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice A single per-second cUSD wage stream owned by a worker (payee).
    /// @param payee The worker entitled to withdraw the accrued wages.
    /// @param ratePerSecond Wage accrual rate, in cUSD base units per second.
    /// @param accrued Wages crystallized at `lastUpdated` but not yet withdrawn.
    /// @param lastUpdated Timestamp of the last accrual checkpoint.
    /// @param paused Whether accrual is currently halted.
    /// @param exists Sentinel marking the slot as a real stream.
    struct Stream {
        address payee;
        uint256 ratePerSecond;
        uint256 accrued;
        uint256 lastUpdated;
        bool paused;
        bool exists;
    }

    /// @notice The cUSD token paid out by this vault.
    IERC20 public immutable cUSD;

    /// @notice Currently claimable payroll liquidity held by the vault.
    uint256 public payrollReserve;

    /// @notice Cumulative cUSD ever funded into the vault; never decreases.
    uint256 public totalFunded;

    /// @notice Sum of `ratePerSecond` across all active (non-paused) streams.
    uint256 public totalStreamRate;

    /// @notice Id assigned to the next stream created.
    uint256 public nextStreamId;

    /// @notice Whether a worker has been marked verified (mirrors a Self attestation).
    mapping(address => bool) public isVerifiedWorker;

    /// @notice Stream records keyed by stream id.
    mapping(uint256 => Stream) public streams;

    /// @notice Emitted when the employer funds the payroll reserve.
    /// @param amount cUSD added in this funding.
    /// @param reserve The resulting payroll reserve.
    event PayrollFunded(uint256 amount, uint256 reserve);

    /// @notice Emitted when a worker's verification flag is set.
    /// @param worker The worker address.
    /// @param verified The new verification state.
    event WorkerVerificationSet(address indexed worker, bool verified);

    /// @notice Emitted when a new wage stream is created.
    /// @param streamId The new stream id.
    /// @param worker The payee of the stream.
    /// @param ratePerSecond The wage accrual rate.
    event StreamCreated(uint256 indexed streamId, address indexed worker, uint256 ratePerSecond);

    /// @notice Emitted when a stream is paused.
    /// @param streamId The paused stream id.
    event StreamPaused(uint256 indexed streamId);

    /// @notice Emitted when a stream is resumed.
    /// @param streamId The resumed stream id.
    event StreamResumed(uint256 indexed streamId);

    /// @notice Emitted when a worker withdraws accrued wages.
    /// @param streamId The stream withdrawn from.
    /// @param worker The payee receiving the cUSD.
    /// @param amount cUSD transferred to the worker.
    event Claimed(uint256 indexed streamId, address indexed worker, uint256 amount);

    /// @notice A zero address was supplied where one is not allowed.
    error ZeroAddress();
    /// @notice A zero amount was supplied where a positive value is required.
    error ZeroAmount();
    /// @notice A zero rate was supplied where a positive rate is required.
    error ZeroRate();
    /// @notice The payee is not a verified worker.
    error WorkerNotVerified();
    /// @notice The referenced stream does not exist.
    error StreamNotFound();
    /// @notice The stream is not paused (resume requires a paused stream).
    error NotPaused();
    /// @notice The caller is not the stream's payee.
    error OnlyWorker();
    /// @notice There is nothing accrued to withdraw.
    error NoAccrual();
    /// @notice The payroll reserve is insufficient to cover the withdrawal.
    error InsufficientLiquidity();

    /// @notice Deploys the vault for a given cUSD token under a given owner.
    /// @param cUSD_ The cUSD token streamed by this vault.
    /// @param initialOwner The employer/owner authorized to fund, verify, and create streams.
    constructor(IERC20 cUSD_, address initialOwner) Ownable(initialOwner) {
        if (address(cUSD_) == address(0) || initialOwner == address(0)) revert ZeroAddress();
        cUSD = cUSD_;
    }

    /// @notice Funds the payroll reserve. The employer must approve this vault for `amount` first.
    /// @dev Pulls cUSD from the caller into the vault and grows both `payrollReserve` and `totalFunded`.
    /// @param amount cUSD to fund (base units, > 0).
    function fundPayroll(uint256 amount) external onlyOwner nonReentrant {
        if (amount == 0) revert ZeroAmount();
        payrollReserve += amount;
        totalFunded += amount;
        cUSD.safeTransferFrom(msg.sender, address(this), amount);
        emit PayrollFunded(amount, payrollReserve);
    }

    /// @notice Sets a worker's verification flag, mirroring a Self Protocol attestation on-chain.
    /// @param worker The worker address (non-zero).
    /// @param verified The verification state to record.
    function setWorkerVerification(address worker, bool verified) external onlyOwner {
        if (worker == address(0)) revert ZeroAddress();
        isVerifiedWorker[worker] = verified;
        emit WorkerVerificationSet(worker, verified);
    }

    /// @notice Creates a per-second cUSD wage stream for a verified worker.
    /// @dev Requires `isVerifiedWorker[payee]`. The new stream starts active and accruing.
    /// @param payee The worker entitled to the stream (non-zero, verified).
    /// @param ratePerSecond The wage accrual rate in cUSD base units per second (> 0).
    /// @return streamId The id of the newly created stream.
    function createStream(address payee, uint256 ratePerSecond)
        external
        onlyOwner
        returns (uint256 streamId)
    {
        if (payee == address(0)) revert ZeroAddress();
        if (ratePerSecond == 0) revert ZeroRate();
        if (!isVerifiedWorker[payee]) revert WorkerNotVerified();

        streamId = nextStreamId++;
        streams[streamId] = Stream({
            payee: payee,
            ratePerSecond: ratePerSecond,
            accrued: 0,
            lastUpdated: block.timestamp,
            paused: false,
            exists: true
        });
        totalStreamRate += ratePerSecond;

        emit StreamCreated(streamId, payee, ratePerSecond);
    }

    /// @notice Pauses a stream, crystallizing accrued wages and halting further accrual.
    /// @dev Removes the stream's rate from `totalStreamRate` while paused.
    /// @param streamId The stream to pause.
    function pauseStream(uint256 streamId) external onlyOwner {
        Stream storage stream = _stream(streamId);
        _accrue(stream);
        if (!stream.paused) {
            totalStreamRate -= stream.ratePerSecond;
            stream.paused = true;
            emit StreamPaused(streamId);
        }
    }

    /// @notice Resumes a paused stream and restarts accrual from now.
    /// @dev Re-adds the stream's rate to `totalStreamRate`.
    /// @param streamId The stream to resume.
    function resumeStream(uint256 streamId) external onlyOwner {
        Stream storage stream = _stream(streamId);
        if (!stream.paused) revert NotPaused();
        stream.paused = false;
        stream.lastUpdated = block.timestamp;
        totalStreamRate += stream.ratePerSecond;
        emit StreamResumed(streamId);
    }

    /// @notice Worker pulls currently accrued cUSD into their wallet.
    /// @dev Only the stream's payee may call. Follows checks-effects-interactions.
    /// @param streamId The stream to withdraw from.
    /// @return amount cUSD transferred to the worker.
    function withdrawAccrued(uint256 streamId) external nonReentrant returns (uint256 amount) {
        Stream storage stream = _stream(streamId);
        if (msg.sender != stream.payee) revert OnlyWorker();
        _accrue(stream);

        amount = stream.accrued;
        if (amount == 0) revert NoAccrual();
        if (payrollReserve < amount) revert InsufficientLiquidity();

        payrollReserve -= amount;
        stream.accrued = 0;
        cUSD.safeTransfer(stream.payee, amount);
        emit Claimed(streamId, stream.payee, amount);
    }

    /// @notice Returns the wages currently withdrawable from a stream.
    /// @param streamId The stream to query.
    /// @return The accrued-plus-live amount (or just accrued if paused).
    function pending(uint256 streamId) external view returns (uint256) {
        Stream storage stream = _stream(streamId);
        if (stream.paused) return stream.accrued;
        return stream.accrued + ((block.timestamp - stream.lastUpdated) * stream.ratePerSecond);
    }

    /// @dev Crystallizes wages accrued since `lastUpdated` and advances the checkpoint.
    function _accrue(Stream storage stream) internal {
        if (!stream.paused) {
            stream.accrued += (block.timestamp - stream.lastUpdated) * stream.ratePerSecond;
        }
        stream.lastUpdated = block.timestamp;
    }

    /// @dev Loads a stream by id, reverting if it does not exist.
    function _stream(uint256 streamId) internal view returns (Stream storage stream) {
        stream = streams[streamId];
        if (!stream.exists) revert StreamNotFound();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title NebulaAtlasFHE
 * @notice FHE-enabled score aggregation and result indexing for the Nebula Atlas game.
 *         Renamed methods vs GeoChainFHE to avoid collision while keeping same behavior.
 */
contract NebulaAtlasFHE is ZamaEthereumConfig {
    struct PlayerStats {
        uint256 numGames;
        uint256 totalPublicScore;
        uint256 maxSinglePublicScore;
        uint256 lastPlayedAt;
    }
    struct AtlasOutcome {
        uint256 id;
        address player;
        bytes32 resultHash;
        string resultCID;
        uint256 scorePublic;
        uint256 timestamp;
    }

    event OutcomeLogged(
        uint256 indexed id,
        address indexed player,
        bytes32 resultHash,
        string resultCID,
        uint256 scorePublic,
        uint256 timestamp
    );

    event QuestionPoolSet(string poolCID, uint256 version);

    // Next outcome id
    uint256 public nextOutcomeId = 1;

    // Per-player encrypted total score
    mapping(address => euint32) private _encryptedTotalByPlayer;
    // Per-outcome encrypted score
    mapping(uint256 => euint32) private _encryptedScoreByOutcomeId;
    // Public stats used for achievements/leaderboard
    mapping(address => PlayerStats) public playerStats;
    // emblemId => player => claimed
    mapping(uint256 => mapping(address => bool)) public emblemClaimed;

    event EmblemRedeemed(address indexed player, uint256 indexed emblemId, uint256 timestamp);

    /**
     * @notice Log a single game outcome with an encrypted score and optional public score.
     * @param scoreExt Encrypted score (externalEuint32)
     * @param inputProof Input proof for `scoreExt`
     * @param resultHash keccak256(JSON) of the full result payload uploaded to IPFS
     * @param resultCID IPFS CID (can be encrypted off-chain if player prefers privacy)
     * @param scorePublic Optional clear score for public leaderboard; use 0 to keep it private
     * @return outcomeId Sequential identifier of the stored outcome
     */
    function logGameOutcome(
        externalEuint32 scoreExt,
        bytes calldata inputProof,
        bytes32 resultHash,
        string calldata resultCID,
        uint32 scorePublic
    ) external returns (uint256 outcomeId) {
        // Verify proof and transform to internal euint32
        euint32 score = FHE.fromExternal(scoreExt, inputProof);

        // Aggregate encrypted total score per player
        euint32 currentTotal = _encryptedTotalByPlayer[msg.sender];
        euint32 newTotal = FHE.add(currentTotal, score);
        _encryptedTotalByPlayer[msg.sender] = newTotal;

        // Grant decryption/auth rights (contract itself + sender)
        FHE.allowThis(newTotal);
        FHE.allow(newTotal, msg.sender);
        // Also allow decrypt on this record's encrypted score
        FHE.allowThis(score);
        FHE.allow(score, msg.sender);

        // Mint outcome id and emit event (lightweight index)
        outcomeId = nextOutcomeId++;
        // Persist per-outcome encrypted score
        _encryptedScoreByOutcomeId[outcomeId] = score;
        // Update public stats (for achievements)
        unchecked {
            PlayerStats storage s = playerStats[msg.sender];
            s.numGames += 1;
            s.totalPublicScore += uint256(scorePublic);
            if (uint256(scorePublic) > s.maxSinglePublicScore) {
                s.maxSinglePublicScore = uint256(scorePublic);
            }
            s.lastPlayedAt = block.timestamp;
        }
        emit OutcomeLogged(
            outcomeId,
            msg.sender,
            resultHash,
            resultCID,
            uint256(scorePublic),
            block.timestamp
        );
    }

    /**
     * @notice Returns the encrypted total score of an address.
     * @dev The returned value is an FHE handle; decrypt via FHEVM (mock or relayer).
     */
    function readEncryptedTotal(address player) external view returns (euint32) {
        return _encryptedTotalByPlayer[player];
    }

    /**
     * @notice Convenience getter for the sender's encrypted total score.
     */
    function readMyEncryptedTotal() external view returns (euint32) {
        return _encryptedTotalByPlayer[msg.sender];
    }

    /**
     * @notice Returns the encrypted score for a specific outcome id.
     */
    function readEncryptedOutcome(uint256 id) external view returns (euint32) {
        return _encryptedScoreByOutcomeId[id];
    }

    /**
     * @notice Return player public stats used by achievements.
     */
    function readPlayerMilestones(address player) external view returns (
        uint256 numGames,
        uint256 totalPublicScore,
        uint256 maxSinglePublicScore,
        uint256 lastPlayedAt
    ) {
        PlayerStats memory s = playerStats[player];
        return (s.numGames, s.totalPublicScore, s.maxSinglePublicScore, s.lastPlayedAt);
    }

    /**
     * @notice Redeem emblem when conditions are met.
     * 1 First Try            numGames >= 1
     * 2 Score 10 Total       totalPublicScore >= 10
     * 3 High Score 20        maxSinglePublicScore >= 20
     * 4 Active (7d >= 3)     numGames >= 3 && lastPlayedAt within 7 days
     * 5 Daily                 lastPlayedAt within 1 day
     * 6 Veteran              numGames >= 10
     */
    function redeemEmblem(uint256 emblemId) external {
        require(!emblemClaimed[emblemId][msg.sender], "Already claimed");
        PlayerStats memory s = playerStats[msg.sender];
        bool ok = false;
        if (emblemId == 1) {
            ok = s.numGames >= 1;
        } else if (emblemId == 2) {
            ok = s.totalPublicScore >= 10;
        } else if (emblemId == 3) {
            ok = s.maxSinglePublicScore >= 20;
        } else if (emblemId == 4) {
            ok = s.numGames >= 3 && s.lastPlayedAt + 7 days >= block.timestamp;
        } else if (emblemId == 5) {
            ok = s.lastPlayedAt + 1 days >= block.timestamp;
        } else if (emblemId == 6) {
            ok = s.numGames >= 10;
        } else {
            revert("Unknown emblem");
        }
        require(ok, "Conditions not met");
        emblemClaimed[emblemId][msg.sender] = true;
        emit EmblemRedeemed(msg.sender, emblemId, block.timestamp);
    }

    /**
     * @notice Admin-only update of question pool CID and version.
     * @dev For MVP, keep it open; in production wire to a multisig/ACL.
     */
    function setQuestionPoolMeta(string calldata poolCID, uint256 version) external {
        emit QuestionPoolSet(poolCID, version);
    }
}



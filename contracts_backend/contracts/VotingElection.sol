// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
    VotingElection (Permanent Election System)
    - Single deployed contract
    - Multiple elections inside
    - One active election at a time
*/

contract VotingElection {

    /* =====================================================
                            ADMIN
    ====================================================== */

    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /* =====================================================
                        ELECTION STATE
    ====================================================== */

    enum ElectionState {
        Created,
        RegistrationOpen,
        VotingOpen,
        Ended
    }

    /* =====================================================
                        STRUCTS
    ====================================================== */

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Election {
        ElectionState state;
        uint registrationEndTime;
        uint votingEndTime;
        bytes32 eventSalt;

        uint candidateCount;
        mapping(uint => Candidate) candidates;

        mapping(address => bool) registered;
        mapping(address => bool) hasVoted;
        mapping(bytes32 => bool) usedIdentities;
        mapping(address => bytes32) voterIdentity;
    }

    /* =====================================================
                        STORAGE
    ====================================================== */

    mapping(uint => Election) private elections;
    uint public electionCounter;
    uint public activeElectionId;

    /* =====================================================
                            EVENTS
    ====================================================== */

    event ElectionCreated(uint electionId);
    event CandidateAdded(uint electionId, uint candidateId, string name);
    event RegistrationStarted(uint electionId, uint endTime);
    event VotingStarted(uint electionId, uint endTime);
    event VoterRegistered(uint electionId, address voter, bytes32 identityHash);
    event VoteCast(uint electionId, address voter, uint candidateId);
    event ElectionEnded(uint electionId);

    /* =====================================================
                        ADMIN FUNCTIONS
    ====================================================== */

    function createElection() external onlyAdmin {
        electionCounter++;

        Election storage e = elections[electionCounter];
        e.state = ElectionState.Created;
        e.eventSalt = keccak256(
            abi.encodePacked(block.timestamp, electionCounter)
        );

        activeElectionId = electionCounter;

        emit ElectionCreated(electionCounter);
    }

    function addCandidate(uint electionId, string memory name)
        external
        onlyAdmin
    {
        Election storage e = elections[electionId];
        require(e.state == ElectionState.Created, "Cannot add candidates now");

        e.candidateCount++;
        e.candidates[e.candidateCount] =
            Candidate(e.candidateCount, name, 0);

        emit CandidateAdded(electionId, e.candidateCount, name);
    }

    function startRegistration(uint electionId, uint durationInSeconds)
        external
        onlyAdmin
    {
        Election storage e = elections[electionId];
        require(e.state == ElectionState.Created, "Invalid state");

        e.state = ElectionState.RegistrationOpen;
        e.registrationEndTime = block.timestamp + durationInSeconds;

        emit RegistrationStarted(electionId, e.registrationEndTime);
    }

    function startVoting(uint electionId, uint durationInSeconds)
        external
        onlyAdmin
    {
        Election storage e = elections[electionId];
        require(e.state == ElectionState.RegistrationOpen, "Registration not completed");
        require(block.timestamp >= e.registrationEndTime, "Registration still active");

        e.state = ElectionState.VotingOpen;
        e.votingEndTime = block.timestamp + durationInSeconds;

        emit VotingStarted(electionId, e.votingEndTime);
    }

    function endElection(uint electionId) external onlyAdmin {
        Election storage e = elections[electionId];
        require(e.state == ElectionState.VotingOpen, "Voting not active");
        require(block.timestamp >= e.votingEndTime, "Voting still active");

        e.state = ElectionState.Ended;

        emit ElectionEnded(electionId);
    }

    /* =====================================================
                        VOTER FUNCTIONS
    ====================================================== */

    function registerVoter(uint electionId, bytes32 identityHash) external {
        Election storage e = elections[electionId];

        require(e.state == ElectionState.RegistrationOpen, "Registration closed");
        require(block.timestamp <= e.registrationEndTime, "Registration time over");
        require(!e.registered[msg.sender], "Wallet already registered");
        require(!e.usedIdentities[identityHash], "Identity already used");

        e.registered[msg.sender] = true;
        e.usedIdentities[identityHash] = true;
        e.voterIdentity[msg.sender] = identityHash;

        emit VoterRegistered(electionId, msg.sender, identityHash);
    }

    function vote(uint electionId, uint candidateId) external {
        Election storage e = elections[electionId];

        require(e.state == ElectionState.VotingOpen, "Voting not open");
        require(block.timestamp <= e.votingEndTime, "Voting time over");
        require(e.registered[msg.sender], "Not registered");
        require(!e.hasVoted[msg.sender], "Already voted");
        require(candidateId > 0 && candidateId <= e.candidateCount, "Invalid candidate");

        e.candidates[candidateId].voteCount++;
        e.hasVoted[msg.sender] = true;

        emit VoteCast(electionId, msg.sender, candidateId);
    }

    /* =====================================================
                        READ FUNCTIONS
    ====================================================== */

    function getCandidate(uint electionId, uint candidateId)
        external
        view
        returns (Candidate memory)
    {
        Election storage e = elections[electionId];
        require(candidateId > 0 && candidateId <= e.candidateCount, "Invalid candidate");
        return e.candidates[candidateId];
    }

    function getElectionState(uint electionId)
        external
        view
        returns (ElectionState)
    {
        return elections[electionId].state;
    }

    function getEventSalt(uint electionId)
        external
        view
        returns (bytes32)
    {
        return elections[electionId].eventSalt;
    }

    function getCandidateCount(uint electionId)
        external
        view
        returns (uint)
    {
        return elections[electionId].candidateCount;
    }
}

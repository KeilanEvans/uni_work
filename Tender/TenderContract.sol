// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TenderContract {
    
    // Struct to store details of a Tender
    struct Tender {
        uint256 id;                 // Unique ID of the tender
        string title;               // Title of the tender
        address creator;            // Address of the tender creator
        uint256 startTime;          // Start time of the tender
        uint256 endTime;            // End time of the tender
        string description;         // Description of what the tender involves
        uint256 bounty;             // Reward that government is willing to pay highestBidder
        uint256 highestBid;         // Highest bid amount received for the tender
        address highestBidder;      // Address of the highest bidder
        bool isOpen;                // Status of the tender (open or closed)
        uint256 votes;              // Number of votes received for the tender
    }

    // Struct to store details of a Bid
    struct Bid {
        uint256 amount;            // Amount of the bid
        bool exists;               // Indicates whether the bid exists
    }

    event TenderClosed(uint256 tenderId, address winner, uint256 winningBid, uint256 bountyAwarded);

    address public owner;          // Address of the contract owner
    Tender[] public tenders;       // Array to store all tenders
    uint256 public tenderTotalCount; 
    address[] private registeredUsers;
    mapping(address => bool) public creatorRegistry;
    mapping(address => bool) public userRegistry; // Mapping to store registered users
    mapping(uint256 => mapping(address => Bid)) public bids; // Mapping from tender ID to bids by address
    mapping(uint256 => mapping(address => bool)) public votes; // Mapping from tender ID to votes by address
    mapping(uint256 => uint256) public bidCountPerTender; // Keep track of number of bids for each tender

    // Modifier to restrict functions to only registered users
    modifier onlyRegisteredUser() {
        require(userRegistry[msg.sender], "You are not a registered user.");
        _;
    }
    
    // Modifier to restrict functions to only registered creators
    modifier onlyRegisteredCreator() {
        require(creatorRegistry[msg.sender], "You are not a registered creator.");
        _;
    }

    // Modifier to restrict functions to only the creator of the tender
    modifier onlyTenderCreator(uint256 tenderId) {
        require(msg.sender == tenders[tenderId].creator, "You are not the creator of this tender.");
        _;
    }

    // Modifier to ensure the tender is open
    modifier tenderOpen(uint256 tenderId) {
        require(tenders[tenderId].isOpen, "Tender is closed.");
        _;
    }

    // Modifier to ensure the tender is closed
    modifier tenderClosed(uint256 tenderId) {
        require(block.timestamp >= tenders[tenderId].endTime, "Tender is still open.");
        _;
    }

    // Constructor to initialize the contract owner
    constructor() {
        owner = msg.sender;
    }

    // Returns the number of bids on a given tenderId
    function getBidCount(uint256 tenderId) external view returns(uint256) {
        return bidCountPerTender[tenderId];
    }

    // Function to register users (only the owner can register users)
    function registerUser(address user) external {
        require(msg.sender == owner, "Only the owner can register users.");
        userRegistry[user] = true;
        registeredUsers.push(user);
    }

    // Function to create a new tender (only registered users can create tenders)
    function createTender(string memory title, uint256 startTime, uint256 endTime, string memory description) external payable onlyRegisteredUser {
        require(startTime < endTime, "Start time must be earlier than end time.");
        uint256 tenderId = tenders.length;
        tenders.push(Tender({
            id: tenderId,
            title: title,
            creator: msg.sender,
            startTime: startTime,
            endTime: endTime,
            description: description,
            bounty: msg.value,
            highestBid: 0,
            highestBidder: address(0),
            isOpen: true,
            votes: 0
        }));

        tenderTotalCount++;
    }

    // Function to place a bid on a tender (only registered users can place bids on open tenders)
    function placeBid(uint256 tenderId) external payable tenderOpen(tenderId) {
        Tender storage tender = tenders[tenderId];

        require(block.timestamp >= tender.startTime, "Bidding hasn't started yet.");
        require(block.timestamp <= tender.endTime, "Bidding time is over.");
        require(!bids[tenderId][msg.sender].exists, "You have already placed a bid.");
        
        bids[tenderId][msg.sender] = Bid({
            amount: msg.value,
            exists: true
        });

        if (msg.value > tender.highestBid) {
            tender.highestBid = msg.value;
            tender.highestBidder = msg.sender;
        }

        bidCountPerTender[tenderId] += 1;
    }

    // Function to revise a bid before bidding time ends
    function reviseBid(uint256 tenderId) external payable tenderOpen(tenderId) {
        Tender storage tender = tenders[tenderId];

        require(bids[tenderId][msg.sender].exists, "No bid placed yet.");
        require(block.timestamp <= tender.endTime, "Bidding time is over.");

        Bid storage existingBid = bids[tenderId][msg.sender];
        require(msg.value != existingBid.amount, "New bid must be different from existing one.");
        
        // Refund the old bid
        payable(msg.sender).transfer(existingBid.amount);

        existingBid.amount = msg.value;

        // Update highest bid if necessary
        if (existingBid.amount > tender.highestBid) {
            tender.highestBid = existingBid.amount;
            tender.highestBidder = msg.sender;
        }
    }

    // Function to vote for a tender (only registered users can vote on open tenders)
    function vote(uint256 tenderId) external onlyRegisteredUser tenderOpen(tenderId) {
        Tender storage tender = tenders[tenderId];

        require(block.timestamp <= tender.endTime, "Voting has ended.");
        require(!votes[tenderId][msg.sender], "You have already voted.");

        votes[tenderId][msg.sender] = true;
        tenders[tenderId].votes++;
    }

    // Function to close a tender and finalize the winner (only the tender creator can close the tender)
    function closeTender(uint256 tenderId) external onlyRegisteredUser tenderClosed(tenderId) {
        Tender storage tender = tenders[tenderId];
        require(tender.isOpen, "Tender Already closed.");
        tender.isOpen = false;
        
        address winner = tender.highestBidder;
        uint256 winningBid = tender.highestBid;
        uint256 bounty = tender.bounty;


        // The creator (Government, Local Council, Contractor) receives the highest bid
        if (winner != address(0) && winningBid > 0) {
            payable(tender.creator).transfer(winningBid);
        }

        // Assign the bounty to the highest bidder if bids were made
        if (winner != address(0) && bounty > 0) {
            payable(winner).transfer(bounty);
        }

        // If there were no bids made, return the bounty to the creator
        if (bidCountPerTender[tenderId] == 0) {
            payable(tender.creator).transfer(bounty);
        }

        // It is safe to assume that if no bids were made, the winning bid = 0 so no need to account for that

        emit TenderClosed(tenderId, winner, winningBid, bounty);
    }

    // Function to return the total number of tenders.
    function tenderCount() external view returns(uint256) {
        return tenders.length;
    }

    // Function to get all Tenders
    function getTenders() external view returns (Tender[] memory) {
        return tenders;
    }

    // Function to get all TenderIDs a user has bid on
    function getBids(address account) external view returns (uint256[] memory) {
        uint256 count = 0;

        // Count how many bids exist for the account
        for (uint256 i = 0; i < tenders.length; i++) {
            if (bids[i][account].exists) {
                count++;
            }
        }

        // Create an array of the appropriate size
        uint256[] memory temp = new uint256[](count);
        uint256 index = 0;

        // Add tenderIDs to the array
        for (uint256 i = 0; i < tenders.length; i++) {
            if (bids[i][account].exists) {
                temp[index] = i; // Add the tenderID
                index++;
            }
        }

        return temp;
    }

    // Function to get the details of a tender
    function getTender(uint256 tenderId) external view returns (
        uint256 id, 
        string memory title,
        address creator, 
        uint256 startTime, 
        uint256 endTime, 
        string memory description,
        uint256 highestBid, 
        address highestBidder, 
        bool isOpen,
        uint256 voteCount
    ) {
        Tender storage tender = tenders[tenderId];
        return (
            tender.id,
            tender.title,
            tender.creator,
            tender.startTime,
            tender.endTime,
            tender.description,
            tender.highestBid,
            tender.highestBidder,
            tender.isOpen,
            tender.votes
        );
    }
}

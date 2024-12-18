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
        uint256 minimumBid;         // The 'reserve' or minimum the government are willing for tender to sell for
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

    mapping(string => bool[4]) private permissions;
    mapping(address => bool[4]) public userRegistry; // Mapping to store registered users permissions
    mapping(address => bool) public isRegistered;
    mapping(uint256 => mapping(address => Bid)) public bids; // Mapping from tender ID to bids by address
    mapping(uint256 => mapping(address => bool)) public votes; // Mapping from tender ID to votes by address
    mapping(uint256 => uint256) public bidCountPerTender; // Keep track of number of bids for each tender

    modifier onlyRegisteredVoter() {
        require(userRegistry[msg.sender][0], "You are not a registered voter.");
        _;
    }

    modifier onlyRegisteredBidder() {
        require(userRegistry[msg.sender][1], "You are not a registered contractor");
        _;
    }

    modifier onlyRegisteredCreator() {
        require(userRegistry[msg.sender][2], "You are not a registered Council.");
        _;
    }

    modifier onlyRegisteredAdmin() {
        require(userRegistry[msg.sender][3], "You are not a registered Admin.");
        _;
    }

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    modifier onlyRegisteredUser() {
        require(isRegistered[msg.sender], "You are not a registered user.");
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


    modifier greaterThanMinimum(uint256 tenderId, uint256 bid) {
        require(bid > tenders[tenderId].minimumBid, "Your bid did not breach the reserve price.");
        _;
    }
    
    // Constructor to initialize the contract owner
    constructor() {
        owner = msg.sender;

        permissions["council"] = [false, false, true, false];
        permissions["contractor"] = [false, true, true, false];
        permissions["voter"] = [true, false, false, false];
        permissions["admin"] = [true, true, true, true];
    }

    //
    function setAdminPermissions(address user) external onlyOwner {
        userRegistry[user] = permissions["admin"];
    }

    // Sets permissions of a given user to a certain level
    function setPermissions(address user, string memory permissionLevel) private onlyRegisteredAdmin {
        userRegistry[user] = permissions[permissionLevel];
    }

    // Returns the total number of bids on a given tenderId
    function getBidCount(uint256 tenderId) external view returns(uint256) {
        return bidCountPerTender[tenderId];
    }

    // Function to register users (only an admin can register users)
    function registerUser(address user, string memory permissionLevel) external onlyRegisteredAdmin {
        require(!isRegistered[user], "User already registered!");

        setPermissions(user, permissionLevel);
        registeredUsers.push(user);
        isRegistered[user] = true;
    }

    // Function to create a new tender (only registered users can create tenders)
    function createTender(
        string memory title, 
        uint256 startTime, 
        uint256 endTime, 
        uint256 bounty, 
        uint256 minBid, 
        string memory description) 
        external payable onlyRegisteredCreator {

        require(startTime < endTime, "Start time must be earlier than end time.");
        require(msg.value == bounty, "You must send the exact amount in Ether for the bounty.");

        uint256 tenderId = tenders.length;
        
        tenders.push(Tender({
            id: tenderId,
            title: title,
            creator: msg.sender,
            startTime: startTime,
            endTime: endTime,
            description: description,
            bounty: bounty,
            minimumBid: minBid,
            highestBid: 0,
            highestBidder: address(0),
            isOpen: true,
            votes: 0
        }));

        tenderTotalCount++;
    }

    // Function to place a bid on a tender (only registered users can place bids on open tenders)
    function placeBid(uint256 tenderId) 
    external payable onlyRegisteredBidder greaterThanMinimum(tenderId, msg.value) tenderOpen(tenderId) {
        Tender storage tender = tenders[tenderId];

        require(block.timestamp >= tender.startTime, "Bidding hasn't started yet.");
        require(block.timestamp <= tender.endTime, "Bidding time is over.");
        require(!bids[tenderId][msg.sender].exists, "You have already placed a bid.");
        require(msg.value > tender.highestBid, "Your bid must be greater than the current highest bid.");

        bids[tenderId][msg.sender] = Bid({
            amount: msg.value,
            exists: true
        });

        tender.highestBid = msg.value;
        tender.highestBidder = msg.sender;
        
        bidCountPerTender[tenderId] += 1;
    }

    // Function to revise a bid before bidding time ends
    function reviseBid(uint256 tenderId) 
    external payable onlyRegisteredBidder greaterThanMinimum(tenderId, msg.value) tenderOpen(tenderId) {
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
    function vote(uint256 tenderId) external onlyRegisteredVoter tenderOpen(tenderId) {
        Tender storage tender = tenders[tenderId];

        require(block.timestamp <= tender.endTime, "Voting has ended.");
        require(!votes[tenderId][msg.sender], "You have already voted.");

        votes[tenderId][msg.sender] = true;
        tenders[tenderId].votes++;
    }

    // Function to close a tender and finalize the winner (only an Admin can close the tender)
    function closeTender(uint256 tenderId) external onlyRegisteredAdmin tenderClosed(tenderId) {
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
    function getBids(address account) external view returns (uint256[] memory, uint256[] memory) {
        uint256 count = 0;

        for (uint256 i = 0; i < tenders.length; i++) {
            if (bids[i][account].exists) {
                count++;
            }
        }

        uint256[] memory tenderIds = new uint256[](count);
        uint256[] memory bidAmounts = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < tenders.length; i++) {
            if (bids[i][account].exists) {
                tenderIds[index] = i; // Add the tenderID
                bidAmounts[index] = bids[i][account].amount; // Add the bid amount
                index++;
            }
        }

        return (tenderIds, bidAmounts);

    }

    function getBidAmount(uint256 tenderId, address account) external view returns (uint256) {
        require(tenderId < tenders.length, "Invalid tenderId");
        require(bids[tenderId][account].exists, "Bid does not exist");
        return bids[tenderId][account].amount;
    }

    // Function to get the details of a tender
    function getTender(uint256 tenderId) external view onlyRegisteredAdmin returns (
        uint256 id, 
        string memory title,
        address creator, 
        uint256 startTime, 
        uint256 endTime, 
        string memory description,
        uint256 bounty,
        uint256 minimumBid,
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
            tender.bounty,
            tender.minimumBid,
            tender.highestBid,
            tender.highestBidder,
            tender.isOpen,
            tender.votes
        );
    }
}

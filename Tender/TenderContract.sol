// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TenderContract {
    
    // Struct to store details of a Tender
    struct Tender {
        uint256 id;                // Unique ID of the tender
        string title;
        address creator;           // Address of the tender creator
        uint256 startTime;         // Start time of the tender
        uint256 endTime;           // End time of the tender
        string description;
        uint256 highestBid;        // Highest bid amount received for the tender
        address highestBidder;     // Address of the highest bidder
        bool isOpen;               // Status of the tender (open or closed)
        uint256 votes;             // Number of votes received for the tender
    }

    // Struct to store details of a Bid
    struct Bid {
        uint256 amount;            // Amount of the bid
        bool exists;               // Indicates whether the bid exists
    }

    address public owner;          // Address of the contract owner
    mapping(address => bool) public userRegistry; // Mapping to store registered users
    Tender[] public tenders;       // Array to store all tenders
    mapping(uint256 => mapping(address => Bid)) public bids; // Mapping from tender ID to bids by address
    mapping(uint256 => mapping(address => bool)) public votes; // Mapping from tender ID to votes by address

    // Modifier to restrict functions to only registered users
    modifier onlyRegisteredUser() {
        require(userRegistry[msg.sender], "You are not a registered user.");
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

    // Function to register users (only the owner can register users)
    function registerUser(address user) external {
        require(msg.sender == owner, "Only the owner can register users.");
        userRegistry[user] = true;
    }

    // Function to create a new tender (only registered users can create tenders)
    function createTender(string title, uint256 startTime, uint256 endTime, string description) external onlyRegisteredUser {
        require(startTime < endTime, "Start time must be earlier than end time.");
        uint256 tenderId = tenders.length;
        tenders.push(Tender({
            id: tenderId,
            title: title,
            creator: msg.sender,
            startTime: startTime,
            endTime: endTime,
            description: description,
            highestBid: 0,
            highestBidder: address(0),
            isOpen: true,
            votes: 0
        }));
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
        require(!votes[tenderId][msg.sender], "You have already voted.");
        votes[tenderId][msg.sender] = true;
        tenders[tenderId].votes++;
    }

    // Function to close a tender and finalize the winner (only the tender creator can close the tender)
    function closeTender(uint256 tenderId) external onlyTenderCreator(tenderId) tenderClosed(tenderId) {
        Tender storage tender = tenders[tenderId];
        tender.isOpen = false;
        
        // Transfer the funds to the tender creator
        if (tender.highestBidder != address(0)) {
            payable(tender.creator).transfer(tender.highestBid);
        }
    }

    // Function to return the total number of tenders.
    function tenderCount() external view returns(uint256) {
        return tenders.length;
    }

    // Overloaded tenderCount() to return only open tenders
    function tenderCount(bool open) external view returns(uint256) {
        uint256 temp = 0;
        if (open) {
            for (uint i = 0; i < tenders.length ; i++) {
            if (tenders[i].isOpen) {
                temp++;
                }
            }
        }
        else {
            return tenders.length;
        }

        return temp;
    }

    // Function to get all Tenders
    // I appreciate that this is probably expensive to run and not at all scalable
    //      but since this is not entirely a practical implementation, it'll do.
    function getTenders() external view returns(Tender[] memory) {
        return tenders;
    }

    // Function to get all TenderIDs a user has bid on
    function getBids(address account) external view returns(Tender[] memory) {
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
        string title,
        address creator, 
        uint256 startTime, 
        uint256 endTime, 
        string description,
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

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
        uint256 bounty;             // Reward that government is willing to pay to highestBidder address
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

    // Events
    event TenderClosed(uint256 tenderId, address winner, uint256 winningBid, uint256 bountyAwarded);
    event UserRegistered(address indexed user, string role);
    event PermissionsUpdated(address indexed user, string permissions);
    event TenderCreated(uint256 tenderId, string title);
    event BidPlaced(uint256 tenderId, uint256 value);
    event VoteSubmitted(uint256 tenderId, address voter);
    event RegistrationStatusChaged(address user, bool registrationStatus);
    event BidRefunded(uint256 tenderId, address bidder, uint256 amount);

    // Global variables
    address public owner;                   // Address of the contract owner
    Tender[] public tenders;                // Array to store all tenders
    uint256 public tenderTotalCount;        // Holds the count for the total number of Tenders
    address[] private registeredUsers;      // Holds array of registered user addresses

    // Mappings for lookups
    mapping(uint256 => address[]) private biddersPerTender;     // Mapping to keep track of all the bidders of a given Tender ID
    mapping(string => bool[4]) private permissions;             // Mapping to store permission profiles 
    mapping(address => bool[4]) private userRegistry;           // Mapping to store registered users permissions
    mapping(address => bool) private isRegistered;              // Mapping that holds register status for a user
    mapping(uint256 => mapping(address => Bid)) private bids;   // Mapping from tender ID to bids by address
    mapping(uint256 => mapping(address => bool)) public votes;  // Mapping from tender ID to votes by address
    mapping(uint256 => uint256) public bidCountPerTender;       // Keep track of number of bids for each tender
    mapping(bytes32 => bool) private uniqueTenderHashes;        // Keep track of unique tenders;

    /*  Defining Modifiers  */

    // Restricts actions to only allow those with voting permissions
    modifier onlyRegisteredVoter() {
        require(userRegistry[msg.sender][0], "You are not a registered voter.");
        _;
    }

    // Restricts actions to those with bidding permissions
    modifier onlyRegisteredBidder() {
        require(userRegistry[msg.sender][1], "You are not a registered contractor");
        _;
    }

    // Restricts user actions to those with tender creation permissions
    modifier onlyRegisteredCreator() {
        require(userRegistry[msg.sender][2], "You are not a registered Administrator.");
        _;
    }

    // For allowing only admins to make specific changes
    modifier onlyRegisteredAdmin() {
        require(userRegistry[msg.sender][3], "You are not a registered Admin.");
        _;
    }

    // Modifier to restrict permissions to only the creator of the tender
    modifier onlyTenderCreator(uint256 tenderId) {
        require(msg.sender == tenders[tenderId].creator, "You are not the creator of this tender.");
        _;
    }

    // Only allows owner to make changes
    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    // Modifier to ensure the given tender is open
    modifier tenderOpen(uint256 tenderId) {
        require(tenders[tenderId].isOpen, "Tender is closed.");
        _;
    }

    // Modifier to ensure the tender is closed
    modifier tenderClosed(uint256 tenderId) {
        require(block.timestamp >= tenders[tenderId].endTime, "Tender is still open.");
        _;
    }

    // Refuses bids that are not greater than the current minimum bid
    modifier greaterThanMinimum(uint256 tenderId, uint256 bid) {
        require(bid > tenders[tenderId].minimumBid, "Your bid did not breach the reserve price.");
        _;
    }

    // Modifier to check if a tender with the same creator, end time, title and description exists
    modifier uniqueTender(address creator, uint256 bounty, uint256 endTime, string memory title, string memory description) {
        bytes32 tenderHash = keccak256(abi.encodePacked(creator, bounty, endTime, title, description));
        require(!uniqueTenderHashes[tenderHash], "Tender with identical details already exists.");
        _;
    }

    /*  Defining Constructor  */
    
    // Constructor to initialize the contract owner
    constructor() {
        // Set owner address
        owner = msg.sender;

        // Instantiate permissions mapping
        permissions["council"] = [false, false, true, false];
        permissions["contractor"] = [false, true, true, false];
        permissions["voter"] = [true, false, false, false];
        permissions["admin"] = [true, true, true, true];
        
        isRegistered[owner] = true;
        userRegistry[owner] = permissions["admin"];
    }

    /*  Defining Setter Functions  */

    // Allow owner to set admin permissions of any registered user 
    function setAdminPermissions(address user) external onlyOwner {
        userRegistry[user] = permissions["admin"];

        emit PermissionsUpdated(user, "admin");
    }

    // Set a new user as an admin, allowing bypass of having to set a user as registered first
    function setNewAdmin(address user) external onlyRegisteredAdmin {
        isRegistered[user] = true;
        userRegistry[user] = permissions["admin"];

        emit PermissionsUpdated(user, "admin");
    }

    // Sets permissions of a given user to a certain level
    function setPermissions(address user, string memory permissionLevel) private onlyRegisteredAdmin {
        userRegistry[user] = permissions[permissionLevel];

        emit PermissionsUpdated(user, permissionLevel);
    }

    // Can switch/set a user's registered status
    //      Useful for MP's or Councils changing and having to remove their registration status
    function setRegistered(address user, bool registrationStatus) private onlyRegisteredAdmin {
        isRegistered[user] = registrationStatus;

        emit RegistrationStatusChaged(user, registrationStatus);
    }

    /*  Defining Primary Functions  */

    // Function to register users (only an admins can register users)
    function registerUser(address user, string memory permissionLevel) external onlyRegisteredAdmin {
        require(!isRegistered[user], "User already registered!");

        setPermissions(user, permissionLevel);
        registeredUsers.push(user);
        isRegistered[user] = true;

        emit UserRegistered(user, permissionLevel);
    }

    // Function to create a new tender:
    // (only registered users with creator permission can create tenders)
    function createTender(
        string memory title, 
        uint256 startTime, 
        uint256 endTime, 
        uint256 bounty, 
        uint256 minBid, 
        string memory description) 
        external payable uniqueTender(msg.sender, bounty, endTime, title, description) onlyRegisteredCreator {

        // Handle poor information parsed to contract
        require(startTime < endTime, "Start time must be earlier than end time.");
        require(msg.value == bounty, "You must send the exact amount in Ether for the bounty.");

        uint256 tenderId = tenders.length;
        
        // Add the Tender to the array of tenders
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

        emit TenderCreated(tenderId, title);
    }

    // Function to place a bid on a tender:
    // (only registered users with bidding permission can place bids on open tenders)
    function placeBid(uint256 tenderId) 
    external payable onlyRegisteredBidder greaterThanMinimum(tenderId, msg.value) tenderOpen(tenderId) {
        Tender storage tender = tenders[tenderId];

        // Handle poor parsed parameters
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

        biddersPerTender[tenderId].push(msg.sender);
        bidCountPerTender[tenderId] += 1;

        emit BidPlaced(tenderId, msg.value);
    }

    // Function to revise a bid before bidding time ends:
    // (only registered users with bidding permission can revise bids)
    //      Additionally, bidders can only revise their bid to greater than the reserve (minimum)
    //      This prevents initiating a bid above minimum then revising it below minimum
    function reviseBid(uint256 tenderId, uint256 additionalBidAmount) 
    external payable onlyRegisteredBidder greaterThanMinimum(
        tenderId, 
        bids[tenderId][msg.sender].amount + additionalBidAmount) 
        tenderOpen(tenderId) {
        Tender storage tender = tenders[tenderId];

        require(bids[tenderId][msg.sender].exists, "No bid placed yet.");
        require(block.timestamp <= tender.endTime, "Bidding time is over.");
        require(msg.value == additionalBidAmount, "Incorrect ETH amount sent.");

        Bid storage existingBid = bids[tenderId][msg.sender];
        uint256 newTotalBid = existingBid.amount + additionalBidAmount;
        require(newTotalBid > existingBid.amount, "Your revised bid must be higher than your previous bid.");

        existingBid.amount = existingBid.amount + msg.value;

        // Update highest bid if necessary
        if (existingBid.amount > tender.highestBid) {
            tender.highestBid = existingBid.amount;
            tender.highestBidder = msg.sender;
        }

        emit BidPlaced(tenderId, msg.value);
    }

    // Function to vote for a tender:
    // (only registered users with voting permissions can vote on open tenders)
    function vote(uint256 tenderId) external onlyRegisteredVoter tenderOpen(tenderId) {
        Tender storage tender = tenders[tenderId];

        require(block.timestamp <= tender.endTime, "Voting has ended.");
        require(!votes[tenderId][msg.sender], "You have already voted.");

        votes[tenderId][msg.sender] = true;
        tenders[tenderId].votes++;

        emit VoteSubmitted(tenderId, msg.sender);
    }

    // Function to close a tender and finalize the winner:
    // (only an Admin can close the tender)
    //      This is done to only allow certified nodes like our locally run node to close tenders
    function closeTender(uint256 tenderId) external onlyRegisteredAdmin tenderClosed(tenderId) {
        Tender storage tender = tenders[tenderId];

        require(tender.isOpen, "Tender Already closed.");
        tender.isOpen = false;
        
        address winner = tender.highestBidder;
        uint256 winningBid = tender.highestBid;
        uint256 minimumBid = tender.minimumBid;
        uint256 bounty = tender.bounty;

        // The creator (Government, Local Council, Contractor) receives the highest bid
        if (winner != address(0) && winningBid > minimumBid) {
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

        // Refund all losing bidders
        address[] storage bidders = biddersPerTender[tenderId];

        for (uint256 i = 0; i < bidders.length; i++) {
            address bidder = bidders[i];

            if (bidder != winner && bids[tenderId][bidder].exists) {
                uint256 refundAmount = bids[tenderId][bidder].amount;

                bids[tenderId][bidder].exists = false;
                payable(bidder).transfer(refundAmount);
                
                emit BidRefunded(tenderId, bidder, refundAmount);
            }
        }

        // It is safe to assume that if no bids were made, the winning bid = 0 so no need to account for that

        emit TenderClosed(tenderId, winner, winningBid, bounty);
    }

    // Function to kill an open tender, forcing it closed and refunding bids and bounty
    //      This allows for the deletion of accidentally created tenders
    function killTender(uint256 tenderId) external payable onlyRegisteredAdmin tenderOpen(tenderId) {
        require(tenderId < tenders.length, "Tender ID is out of bounds for length of array tenders");
        Tender storage tender = tenders[tenderId];

        // return bounty to creator
        payable(tender.creator).transfer(tender.bounty);

        // return bids to bidders
        address[] storage bidders = biddersPerTender[tenderId];
        for (uint256 i = 0; i < bidders.length; i++) {
            address bidder = bidders[i];

            if (bids[tenderId][bidder].exists) {
                uint256 refundAmount = bids[tenderId][bidder].amount;

                payable(bidder).transfer(refundAmount);

                emit BidRefunded(tenderId, bidder, refundAmount);
            }
        }

        tender.isOpen = false;
    }

    // Function to return the total number of tenders.
    function tenderCount() external view returns(uint256) {
        return tenders.length;
    }

    /*  Defining Getter Functions  */

    // Function to get all Tenders
    function getTenders() external view returns (Tender[] memory) {
        return tenders;
    }

    // Returns the total number of bids on a given tenderId
    function getBidCount(uint256 tenderId) external view returns(uint256) {
        return bidCountPerTender[tenderId];
    }

    // Function to get all TenderIDs a user has bid on
    // Returns an array of tenderIDs the user has bid on and an array of their bid amounts
    function getBids(address account) external view returns (uint256[] memory, uint256[] memory) {
        uint256 count = 0;

        // First get the number of bids the user has made
        for (uint256 i = 0; i < tenders.length; i++) {
            if (bids[i][account].exists) {
                count++;
            }
        }

        uint256[] memory tenderIds = new uint256[](count);
        uint256[] memory bidAmounts = new uint256[](count);
        uint256 index = 0;

        // Now add those instances to the return variables
        for (uint256 i = 0; i < tenders.length; i++) {
            if (bids[i][account].exists) {
                tenderIds[index] = i; // Add the tenderID
                bidAmounts[index] = bids[i][account].amount; // Add the bid amount
                index++;
            }
        }

        return (tenderIds, bidAmounts);

    }

    // Gets the amount a user has bid on a given tender
    function getBidAmount(uint256 tenderId, address account) external view returns (uint256) {
        require(tenderId < tenders.length, "Invalid tenderId");
        require(bids[tenderId][account].exists, "Bid does not exist");

        return bids[tenderId][account].amount;
    }

    // Function to get the details of a tender
    function getTender(uint256 tenderId) external view returns (
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

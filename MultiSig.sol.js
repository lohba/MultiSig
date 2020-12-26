pragma solidity 0.7.5;
pragma abicoder v2;

//["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"]

contract Wallet {
    address[] public owners;
    uint limit; // how many owners need to sign off
    
      struct Transfer {
        uint amount;
        address payable receiver; 
        uint approvals;
        bool hasBeenSent;
        uint id;
    }
    
    event TransferRequestCreated(uint _id, uint _amount, address _initiator, address _receiver);
    event ApprovalReceived(uint _id, uint _approvals, address _approver);
    event TransferApproved(uint _id);
    
    Transfer[] transferRequests; // stroe all transfer requests
    
    mapping(address => mapping(uint => bool)) approvals;
    
    //Should only allow people in the owners list to continue the execution.
    modifier onlyOwners(){
        bool owner = false;
        for(uint i = 0; i < owners.length; i++){
             if(owners[i] == msg.sender) {
                 owner = true;
             }
        }
        require(owner == true);
        _;
    }
    //Should initialize the owners list and the limit
    constructor(address[] memory _owners, uint _limit){
        owners = _owners;
        limit = _limit;
    }
    
    //Empty function
    function deposit() public payable {}
    
    //Create an instance of the Transfer struct and add it to the transferRequests array
    function createTransfer(uint _amount, address payable _receiver) public onlyOwners {
        emit TransferRequestCreated(transferRequests.length, _amount, msg.sender, _receiver);
        transferRequests.push(Transfer(_amount, _receiver, 0, false, transferRequests.length));
    }
    
    function approve(uint _id) public onlyOwners {
        //an owner should not be able to vote twice
        require(approvals[msg.sender][_id] == false);
        //an owner should not be able to vote on a transfer request that has already been semt
        require(transferRequests[_id].hasBeenSent == false);
        
        //Need to update the mapping to record the approval for the msg.sender
        approvals[msg.sender][_id] = true;
        //Need to update the Transfer object
        transferRequests[_id].approvals++;
        
        emit ApprovalReceived(_id, transferRequests[_id].approvals, msg.sender);
        
        //check if it has correct amount of approvals
        if(transferRequests[_id].approvals >= limit){
            transferRequests[_id].hasBeenSent = true;
            transferRequests[_id].receiver.transfer(transferRequests[_id].amount);
            emit TransferApproved(_id);
        }
    }
    
    //Should return all transfer transfer transfer requets 
    function getTransferRequests() public view returns (Transfer[] memory) {
        return transferRequests;
    }
    
    //mapping[address][transferID] => true/false
}
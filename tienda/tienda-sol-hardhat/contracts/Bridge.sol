// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract Bridge {
    mapping (address => uint256[]) internal depositList;
    address internal owner;
    bool internal lock;
    uint256 public totalBalance;
    uint256 internal fees;
    uint32 public commission; // cwithdrwal commission in bp (between 0 and 100000)

    constructor() {
        owner = msg.sender;
        fees=0;
        commission=100;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier noReentry() { 
        require(!lock, "Mala suerte atacante !!!");
        lock=true;
        _; 
        lock = false;
    }

    function deposit(uint256 nonce) external payable{
        require(depositList[msg.sender].length==nonce, "nonce is wrong");
        totalBalance+= msg.value;
        depositList[msg.sender].push(msg.value);
    }

    function getNonce(address sender) public view returns(uint256) {
        return depositList[sender].length;
    }

    function getTx(address sender, uint txNumber) public view returns(uint256) {
        //require(hashList[sender]!=null, "no hash");
        return depositList[sender][txNumber];
    }


    function withdraw(uint amount, address to) external onlyOwner noReentry{
        require((totalBalance-fees) >= amount, "Balance insuficiente");
        require(amount>0, "importe debe ser positivo");
        require(amount<1000000000000000000000000000, "importe debe ser menos de 1.000.000.000 ethers");
        uint256 amountW = (amount *(10000-commission))/10000;
        (bool withdrawn,) = to.call {value: amountW}("");
        require(withdrawn == true, "No se pudo enviar el dinero");
        fees+= amount-amountW;
        totalBalance-=amountW;
    }


    function payFees() external onlyOwner noReentry {
        require(fees>0, "fees tiene que ser positivo");
        require(totalBalance >= fees, "Balance insuficiente");
        (bool withdrawn,) = owner.call {value: fees}("");
        require(withdrawn == true, "No se pudo enviar los fees");
        totalBalance-=fees;
        fees=0;
    }

    function changeCommission(uint32 newCommission) external onlyOwner {
        require(newCommission <=10000, "Commission tiene que ser menos de 10000 bp");
        commission = newCommission;
    }

    function getBalance() public view returns(uint) {
        return totalBalance;
    }

    function getFees() public view onlyOwner returns(uint) {
        return fees;
    }    

    fallback() external payable {
    }

    receive() external payable {
    }
}
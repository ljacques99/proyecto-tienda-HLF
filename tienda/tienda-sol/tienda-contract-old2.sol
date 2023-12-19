// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract tiendaBridge {
    mapping (address => uint256[]) internal depositList;
    address internal owner;
    bool internal lock;
    uint256 public totalBalance;
    uint256 internal fees;

    constructor() {
        owner = msg.sender;
        fees=0;
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
        require(totalBalance >= amount, "Balance insuficiente");
        require(amount>0, "importe debe ser positivo");
        (bool withdrawn,) = to.call {value: amount}("");
        require(withdrawn == true, "No se pudo enviar el dinero");
        totalBalance-=amount;
    }

    function addFees(uint amount) external onlyOwner {
        require(amount>0, "importe debe ser positivo");
        fees+=amount;
    }

    function payFees() external onlyOwner noReentry {
        require(fees>0, "fees tiene que ser positivo");
        (bool withdrawn,) = owner.call {value: fees}("");
        require(withdrawn == true, "No se pudo enviar los fees");
        totalBalance-=fees;
        fees=0;
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
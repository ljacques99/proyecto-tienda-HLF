// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract tiendaBridge {
    mapping (address => uint256[]) internal depositList;
    address internal owner;
    bool internal lock;
    uint256 public totalBalance;

    constructor() {
        owner = msg.sender;
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
        require(totalBalance > amount, "Balance insuficiente");
        (bool withdrawn,) = to.call {value: amount}("");
        require(withdrawn == true, "No se pudo enviar el dinero");
        totalBalance-=amount;
    }

    function getBalance() public view returns(uint) {
        return totalBalance;
    }

    

    fallback() external payable {
    }

    receive() external payable {
    }
}
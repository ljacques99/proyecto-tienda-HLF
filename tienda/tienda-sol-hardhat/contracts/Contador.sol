// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract Contador {
    uint public contador;

    constructor (uint inicio){
        contador = inicio;
    }
    function inc() public {
        contador++;
    }
    function dec() public {
        contador--;
    }
    function reset() public {
        contador = 0;
    }
    function getContador() public view returns (uint){
        return contador;
    }
}
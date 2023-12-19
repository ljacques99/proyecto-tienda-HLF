const hre = require("hardhat");

async function main() {
    const contract = await hre.ethers.deployContract("Contador", [0]);
    const contractDeploy = await contract.waitForDeployment();
    const contractAdd = contractDeploy.target;
    hre.smartContractFormatter.setAddress("Contador", contractAdd);
    console.log('The contract address is: ', contractAdd);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
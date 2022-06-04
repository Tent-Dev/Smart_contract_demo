const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});

describe("myToken", function () {
  it("Should send coin to owner correctly", async function () {
    const [owner] = await ethers.getSigners();

    const Mytoken = await ethers.getContractFactory("MyToken_zip");
    const mytoken = await Mytoken.deploy();
    await mytoken.deployed();

    const ownerBalance = await mytoken.balanceOf(owner.address);
    console.log('Account balance: '+ ownerBalance);
    console.log('Amount: '+ ethers.utils.formatEther(ownerBalance) + ' Token');

    expect(await mytoken.totalSupply()).to.equal(ownerBalance);

  });
});

describe("myToken", function () {
  it("Should transter token to Receiver correctly", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Mytoken = await ethers.getContractFactory("MyToken_zip");
    const mytoken = await Mytoken.deploy();
    await mytoken.deployed();

    let ownerBalance = await mytoken.balanceOf(owner.address);
    console.log('Sender balance: '+ ownerBalance);
    console.log('Sender Amount: '+ ethers.utils.formatEther(ownerBalance) + ' Token');

    await mytoken.transfer(addr1.address, 5000000000000000000n);
    expect(await mytoken.balanceOf(addr1.address)).to.equal(5000000000000000000n);
    ownerBalance = await mytoken.balanceOf(owner.address);
    console.log('Sender Amount: '+ ethers.utils.formatEther(ownerBalance) + ' Token');

    let receiverBalance = await mytoken.balanceOf(addr1.address);
    console.log('Receiver Amount: '+ ethers.utils.formatEther(receiverBalance) + ' Token');

  });
});

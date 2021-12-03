const ethers = require('ethers');
const truffleAssert = require('truffle-assertions');
const BN = require('bn.js');
const { expectRevert, time } = require('@openzeppelin/test-helpers');

let Exchange = artifacts.require("Exchange.sol");

const POSTFIX_WEI = "000000000000000000";

contract("Exchange", async accounts => {

    let token;
    let exchange;

    before(async () => {
        exchange = await Exchange.new();
        console.log(`exchange address = ${exchange.address}`);

        console.log(`contract balanceOf = ${await exchange.balanceOf(exchange.address)}`);
        console.log(`contract balance = ${await web3.eth.getBalance(exchange.address)}`);

        console.log(`accounts[0] balanceOf = ${await exchange.balanceOf(accounts[0])}`);
        console.log(`accounts[0] balance = ${await web3.eth.getBalance(accounts[0])}`);

        console.log(`accounts[1] balanceOf = ${await exchange.balanceOf(accounts[1])}`);
        console.log(`accounts[1] balance = ${await web3.eth.getBalance(accounts[1])}`);
    });

    it("buyTokens() >> ", async () => {
        console.log("\n << buyTokens() :");

        let estimatedGas = await exchange.buyTokens.estimateGas({ from: accounts[1], value: new BN("5") });
        console.log( `Estimate Gas buyTokens(): ${estimatedGas}` ); 

        await exchange.buyTokens({ from: accounts[1], value: new BN("5") });

        console.log(`contract balanceOf = ${await exchange.balanceOf(exchange.address)}`);
        console.log(`contract balance = ${await web3.eth.getBalance(exchange.address)}`);

        console.log(`accounts[0] balanceOf = ${await exchange.balanceOf(accounts[0])}`);
        console.log(`accounts[0] balance = ${await web3.eth.getBalance(accounts[0])}`);

        console.log(`accounts[1] balanceOf = ${await exchange.balanceOf(accounts[1])}`);
        console.log(`accounts[1] balance = ${await web3.eth.getBalance(accounts[1])}`);
    });
    

    it("buyTokens() >> ", async () => {
        console.log("\n << buyTokens() :");
        await exchange.buyTokens({ from: accounts[1], value: new BN("1" + POSTFIX_WEI) });
        
        console.log(`contract balanceOf    = ${await exchange.balanceOf(exchange.address)}`);
        console.log(`contract balance = ${await web3.eth.getBalance(exchange.address)}`);

        console.log(`accounts[1] balanceOf = ${await exchange.balanceOf(accounts[1])}`);
        console.log(`accounts[1] balance   = ${await web3.eth.getBalance(accounts[1])}`);
    });

    it("buyTokens() >> ", async () => {
        console.log("\n << buyTokens() :");
        await exchange.buyTokens({ from: accounts[1], value: new BN("80" + POSTFIX_WEI) });
      
        console.log(`contract balanceOf    = ${await exchange.balanceOf(exchange.address)}`);
        console.log(`contract balance      = ${await web3.eth.getBalance(exchange.address)}`);

        console.log(`accounts[1] balanceOf = ${await exchange.balanceOf(accounts[1])}`);
        console.log(`accounts[1] balance   = ${await web3.eth.getBalance(accounts[1])}`);
    });

    it("buyTokens() >> ", async () => {
        console.log("\n << buyTokens() :");
        let a = await exchange.buyTokens({ from: accounts[2], value: new BN("80" + POSTFIX_WEI) });
        console.log( `${a}`);

        console.log(`contract balanceOf    = ${await exchange.balanceOf(exchange.address)}`);
        console.log(`contract balance      = ${await web3.eth.getBalance(exchange.address)}`);

        console.log(`accounts[2] balanceOf = ${await exchange.balanceOf(accounts[2])}`);
        console.log(`accounts[2] balance   = ${await web3.eth.getBalance(accounts[2])}`);
    });
});





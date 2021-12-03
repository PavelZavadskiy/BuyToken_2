const truffleAssert = require('truffle-assertions');
import { assert, web3, artifacts } from "hardhat";

const Exchange = artifacts.require("Exchange");

const Dai = artifacts.require("Dai");
const AgregatorDaiEth = artifacts.require("AgregatorDaiEth");
const AgregatorEthSst = artifacts.require("AgregatorEthSst");

const bn1e18 = web3.utils.toBN(1e18);
const bn1e17 = web3.utils.toBN(1e17);

describe("Exchange", () => {
    let accounts: string[];
    let owner: any;
    let payer: any;
    let exchange: any;
    let dai_token: any;
    let agregator_dai_to_eth: any;
    let agregator_eth_to_sst: any;
  
    const paymentAmount = bn1e18.muln(1);
  
    beforeEach(async function () {
        accounts = await web3.eth.getAccounts();
        owner = accounts[0];
        payer = accounts[1];

        dai_token = await Dai.new();
        agregator_dai_to_eth = await AgregatorDaiEth.new();
        agregator_eth_to_sst = await AgregatorEthSst.new();
        exchange = await Exchange.new(agregator_eth_to_sst.address, dai_token.address, agregator_dai_to_eth.address);

        exchange.mint(exchange.address, bn1e18.muln(1000), {from: owner});
        dai_token.mint(payer, bn1e18.muln(50000), {from: owner});
    });

    describe( "buyTokens", function() {
        it("Should buyTokens successfully", async () => {
            const amount_sst_in_payer = await exchange.balanceOf(payer);
            const amount_sst_in_contract = await exchange.balanceOf(exchange.address);
            const amount_eth_in_payer = web3.utils.toBN(await web3.eth.getBalance(payer));
            const amount_eth_in_contract = web3.utils.toBN(await web3.eth.getBalance(exchange.address));
            const amount_eth_in = bn1e17.muln(1);
            const expected_amount_sst_payer = web3.utils.toBN("464706547924000000000");
            
            const result = await exchange.buyTokens({from: payer, value: amount_eth_in});

            const transaction = await web3.eth.getTransaction(result.tx);
            const used_gas = web3.utils.toBN(result.receipt.gasUsed);
            const gas_price = web3.utils.toBN(transaction.gasPrice);

            const amount_sst_out_payer = await exchange.balanceOf(payer);
            const amount_sst_out_contract = await exchange.balanceOf(exchange.address);
            const amount_eth_out_payer = web3.utils.toBN(await web3.eth.getBalance(payer));
            const amount_eth_out_contract = web3.utils.toBN(await web3.eth.getBalance(exchange.address));
           
            assert.equal(true, amount_sst_out_payer.eq(expected_amount_sst_payer));
            assert.equal(true, amount_sst_out_contract.eq(amount_sst_in_contract.sub(expected_amount_sst_payer)));
            assert.equal(true, amount_eth_in.eq(amount_eth_out_contract));
            assert.equal(true, amount_eth_out_payer.eq(amount_eth_in_payer.sub(used_gas.mul(gas_price)).sub(amount_eth_in)));
        });

        it("Should not conduct a transaction. The contract does not have enough tokens for transfer.", async () => {
            const amount_sst_in_payer = await exchange.balanceOf(payer);
            const amount_sst_in_contract = await exchange.balanceOf(exchange.address);
            const amount_eth_in_payer = web3.utils.toBN(await web3.eth.getBalance(payer));
            const amount_eth_in_contract = web3.utils.toBN(await web3.eth.getBalance(exchange.address));
            const expected_amount_sst_payer = web3.utils.toBN("464706547924000000000");
            const amount_eth_in = bn1e18.muln(10);
      
            const result = await exchange.buyTokens({from: payer, value: amount_eth_in});

            const transaction = await web3.eth.getTransaction(result.tx);
            const used_gas = web3.utils.toBN(result.receipt.gasUsed);
            const gas_price = web3.utils.toBN(transaction.gasPrice);

            const amount_sst_out_payer = await exchange.balanceOf(payer);
            const amount_sst_out_contract = await exchange.balanceOf(exchange.address);
            const amount_eth_out_payer = web3.utils.toBN(await web3.eth.getBalance(payer));
            const amount_eth_out_contract = web3.utils.toBN(await web3.eth.getBalance(exchange.address));
           
            assert.equal(true, amount_sst_in_payer.eq(amount_sst_out_payer));
            assert.equal(true, amount_sst_in_contract.eq(amount_sst_out_contract));
            assert.equal(true, amount_eth_in_contract.eq(amount_eth_out_contract));
            assert.equal(true, amount_eth_out_payer.eq(amount_eth_in_payer.sub(used_gas.mul(gas_price))));
        });
    });

    describe( "buyTokenForDai", function() {
        it("Should buyTokenForDai successfully", async () => {

            const amount_sst_in_payer = await exchange.balanceOf(payer);
            const amount_dai_in_payer = await dai_token.balanceOf(payer);
            const amount_sst_in_contract = await exchange.balanceOf(exchange.address);
            const amount_dai_in_contract = await dai_token.balanceOf(exchange.address);
            
            const amount_dai_in = bn1e18.muln(100);
            const expected_amount_sst_payer = web3.utils.toBN("99778639772206700867");

            await dai_token.approve(exchange.address, bn1e18.muln(100), {from: payer});
            await exchange.buyTokensForDai(amount_dai_in, {from: payer});

            const amount_sst_out_payer = await exchange.balanceOf(payer);
            const amount_dai_out_payer = await dai_token.balanceOf(payer);
            const amount_sst_out_contract = await exchange.balanceOf(exchange.address);
            const amount_dai_out_contract = await dai_token.balanceOf(exchange.address);

            assert.equal(true, amount_sst_out_payer.eq(amount_sst_in_contract.sub(amount_sst_out_contract)));
            assert.equal(true, amount_dai_out_contract.eq(amount_dai_in_payer.sub(amount_dai_out_payer)));
            assert.equal(true, expected_amount_sst_payer.eq(amount_sst_out_payer));
        });

        it("Should not conduct a transaction. The contract does not have enough tokens for transfer.", async () => {
            const amount_dai_in = bn1e18.muln(2000);

            const amount_sst_in_payer = await exchange.balanceOf(payer);
            const amount_dai_in_payer = await dai_token.balanceOf(payer);
            const amount_sst_in_contract = await exchange.balanceOf(exchange.address);
            const amount_dai_in_contract = await dai_token.balanceOf(exchange.address);

            await dai_token.approve(exchange.address, amount_dai_in, {from: payer});
            const result = await exchange.buyTokensForDai(amount_dai_in, {from: payer});

            const amount_sst_out_payer = await exchange.balanceOf(payer);
            const amount_dai_out_payer = await dai_token.balanceOf(payer);
            const amount_sst_out_contract = await exchange.balanceOf(exchange.address);
            const amount_dai_out_contract = await dai_token.balanceOf(exchange.address);

            assert.equal(true, amount_sst_in_payer.eq(amount_sst_out_payer));
            assert.equal(true, amount_dai_in_payer.eq(amount_dai_out_payer));
            assert.equal(true, amount_sst_in_contract.eq(amount_sst_out_contract));
            assert.equal(true, amount_dai_in_contract.eq(amount_dai_out_contract));

        });

        it("Should not conduct a transaction. The calculated amount of tokens is 0.", async () => {
            const amount_dai_in = web3.utils.toBN(2);

            const amount_sst_in_payer = await exchange.balanceOf(payer);
            const amount_dai_in_payer = await dai_token.balanceOf(payer);
            const amount_sst_in_contract = await exchange.balanceOf(exchange.address);
            const amount_dai_in_contract = await dai_token.balanceOf(exchange.address);

            await dai_token.approve(exchange.address, amount_dai_in, {from: payer});
            const result = await exchange.buyTokensForDai(amount_dai_in, {from: payer});

            const amount_sst_out_payer = await exchange.balanceOf(payer);
            const amount_dai_out_payer = await dai_token.balanceOf(payer);
            const amount_sst_out_contract = await exchange.balanceOf(exchange.address);
            const amount_dai_out_contract = await dai_token.balanceOf(exchange.address);

            assert.equal(true, amount_sst_in_payer.eq(amount_sst_out_payer));
            assert.equal(true, amount_dai_in_payer.eq(amount_dai_out_payer));
            assert.equal(true, amount_sst_in_contract.eq(amount_sst_out_contract));
            assert.equal(true, amount_dai_in_contract.eq(amount_dai_out_contract));
        });

        it("Should not conduct a transaction. You send 0 tokens.", async () => {
            const amount_dai_in = web3.utils.toBN(0);

            const amount_sst_in_payer = await exchange.balanceOf(payer);
            const amount_dai_in_payer = await dai_token.balanceOf(payer);
            const amount_sst_in_contract = await exchange.balanceOf(exchange.address);
            const amount_dai_in_contract = await dai_token.balanceOf(exchange.address);

            await dai_token.approve(exchange.address, amount_dai_in, {from: payer});
            const result = await exchange.buyTokensForDai(amount_dai_in, {from: payer});

            const amount_sst_out_payer = await exchange.balanceOf(payer);
            const amount_dai_out_payer = await dai_token.balanceOf(payer);
            const amount_sst_out_contract = await exchange.balanceOf(exchange.address);
            const amount_dai_out_contract = await dai_token.balanceOf(exchange.address);

            assert.equal(true, amount_sst_in_payer.eq(amount_sst_out_payer));
            assert.equal(true, amount_dai_in_payer.eq(amount_dai_out_payer));
            assert.equal(true, amount_sst_in_contract.eq(amount_sst_out_contract));
            assert.equal(true, amount_dai_in_contract.eq(amount_dai_out_contract));
        });
    });

    describe( "refund", function() {
        it("Should refund successfully. Refund dai to owner.", async () => {
            const amount_dai_in = bn1e18.muln(100);
            await dai_token.approve(exchange.address, amount_dai_in, {from: payer});
            await exchange.buyTokensForDai(amount_dai_in, {from: payer});

            const amount_dai_in_owner = await dai_token.balanceOf(owner);
            const amount_dai_in_contract = await dai_token.balanceOf(exchange.address);     
            
            assert.equal(false, amount_dai_in_contract.eq(web3.utils.toBN(0)));
              
            await exchange.refund({from: owner});

            const amount_dai_out_contract = await dai_token.balanceOf(exchange.address);
            const amount_dai_out_owner = await dai_token.balanceOf(owner);

            assert.equal(true, amount_dai_out_contract.eq(web3.utils.toBN(0)));
            assert.equal(true, amount_dai_in_contract.eq(amount_dai_out_owner.sub(amount_dai_in_owner)));
        });

        it("Should refund successfully. Refund ether to owner.", async () => {
            const amount_eth_in = bn1e17.muln(1);
            await exchange.buyTokens({from: payer, value: amount_eth_in});

            const amount_eth_in_owner = web3.utils.toBN(await web3.eth.getBalance(owner));
            const amount_eth_in_contract = web3.utils.toBN(await web3.eth.getBalance(exchange.address));

            assert.equal(false, amount_eth_in_contract.eq(web3.utils.toBN(0)));

            const result = await exchange.refund({from: owner});

            const transaction = await web3.eth.getTransaction(result.tx);
            const used_gas = web3.utils.toBN(result.receipt.gasUsed);
            const gas_price = web3.utils.toBN(transaction.gasPrice);

            const amount_eth_out_owner = web3.utils.toBN(await web3.eth.getBalance(owner));
            const amount_eth_out_contract = web3.utils.toBN(await web3.eth.getBalance(exchange.address));

            assert.equal(true, amount_eth_out_contract.eq(web3.utils.toBN(0)));
            assert.equal(true, amount_eth_out_owner.eq(amount_eth_in_owner.add(amount_eth_in_contract).sub(used_gas.mul(gas_price))));
        });

        it("Should not refund. Ownable: caller is not the owner.", async () => {
            const amount_eth_in = bn1e17.muln(1);
            await exchange.buyTokens({from: payer, value: amount_eth_in});

            const amount_eth_in_contract = web3.utils.toBN(await web3.eth.getBalance(exchange.address));

            assert.equal(false, amount_eth_in_contract.eq(web3.utils.toBN(0)));

            await truffleAssert.reverts(exchange.refund({from: payer}), "Ownable: caller is not the owner");
        });
    });
});
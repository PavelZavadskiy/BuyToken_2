// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "./Token.sol";

interface I_Agregator{
    function decimals() external view returns (uint8);
    function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

contract Exchange is Token {
    address sst_agregator;  
    address dai_agregator;
    address dai_address;

    constructor (address _sst_agregator, address _dai_address, address _dai_agregator) {
        sst_agregator = _sst_agregator;
        dai_address = _dai_address;
        dai_agregator = _dai_agregator;
    }

    function buyTokens() public payable{
        ( , int256 _priceSst, , , ) = I_Agregator(sst_agregator).latestRoundData();
        uint256 _decimalsSst = uint256(I_Agregator(sst_agregator).decimals());
        uint256 _numberTokens = (msg.value * uint256(_priceSst)) / 10**_decimalsSst;
        if(balanceOf(address(this)) < _numberTokens) {
            (bool sent, ) = msg.sender.call{value: msg.value}("Sorry, there is not enough tokens to buy!");          
            return;
        }
        _transfer(address(this), msg.sender, _numberTokens);
    }

    function buyTokensForDai(uint256 _amountDai) public {
        if(_amountDai == 0){
            (bool sent, ) = msg.sender.call("Sorry, You send 0 tokens!");
            return;
        }

        ( , int256 _priceDai, , , ) = I_Agregator(dai_agregator).latestRoundData();
        uint256 _decimalsDai = uint256(I_Agregator(dai_agregator).decimals());
        uint256 _ethDai = _amountDai * uint256(_priceDai) / 10**_decimalsDai;

        ( , int256 _priceSst, , , ) = I_Agregator(sst_agregator).latestRoundData();
        uint256 _decimalsSst = uint256(I_Agregator(sst_agregator).decimals());
        uint256 _numberTokens = (_ethDai * uint256(_priceSst)) / 10**_decimalsSst;
        
        if(_numberTokens == 0){
            (bool sent, ) = msg.sender.call("Sorry, calculated 0 tokens!");
            return;
        } else if(balanceOf(address(this)) < _numberTokens) {
            (bool sent, ) = msg.sender.call("Sorry, there is not enough tokens to buy!");
            return;
        }

        IERC20(dai_address).transferFrom(msg.sender, address(this), _amountDai);
        _transfer(address(this), msg.sender, _numberTokens);
    } 

    function refund() public onlyOwner {
        uint256 ethBalance = address(this).balance;
        if(ethBalance>0) {
            payable(owner()).transfer(ethBalance);
        }
        uint256 daiBalance = IERC20(dai_address).balanceOf(address(this));
        if(daiBalance>0) {
            IERC20(dai_address).transfer(owner(), daiBalance);
        } 
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LiquidityPool {
    IERC20 public token;
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress); // 토큰 컨트랙트 주소 저장
    }

    function addLiquidity(uint256 tokenAmount) public payable {
        require(msg.value > 0, "Must send ETH");
        require(tokenAmount > 0, "Must send tokens");

        token.transferFrom(msg.sender, address(this), tokenAmount);
        liquidity[msg.sender] += msg.value;
        totalLiquidity += msg.value;
    }

    function removeLiquidity() public {
        uint256 userLiquidity = liquidity[msg.sender];
        require(userLiquidity > 0, "No liquidity provided");

        uint256 tokenAmount = (userLiquidity * token.balanceOf(address(this))) /
            totalLiquidity;

        token.transfer(msg.sender, tokenAmount);
        payable(msg.sender).transfer(userLiquidity);

        totalLiquidity -= userLiquidity;
        liquidity[msg.sender] = 0;
    }

    function getPrice() public view returns (uint256) {
        return (token.balanceOf(address(this)) * 1e18) / address(this).balance;
    }
}

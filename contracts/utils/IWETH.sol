// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../token/ERC20/IERC20.sol';
import '../token/ERC20/IERC20Metadata.sol';

/**
 * @title WETH (Wrapped ETH) interface
 */
interface IWETH is IERC20, IERC20Metadata {
  /**
   * @notice convert ETH to WETH
   */
  function deposit () external payable;

  /**
   * @notice convert WETH to ETH
   * @dev if caller is a contract, it should have a fallback or receive function
   * @param amount quantity of WETH to convert, denominated in wei
   */
  function withdraw (
    uint amount
  ) external;
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './ERC20.sol';

contract ERC20Mock is ERC20 {
  using ERC20MetadataStorage for ERC20MetadataStorage.Layout;

  constructor (
    string memory name,
    string memory symbol,
    uint8 decimals,
    uint supply
  ) {
    ERC20MetadataStorage.Layout storage l = ERC20MetadataStorage.layout();

    l.setName(name);
    l.setSymbol(symbol);
    l.setDecimals(decimals);

    _mint(msg.sender, supply);
  }

  function mint (
    address account,
    uint amount
  ) external {
    _mint(account, amount);
  }

  function burn (
    address account,
    uint amount
  ) external {
    _burn(account, amount);
  }
}

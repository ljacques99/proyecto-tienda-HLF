/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const tiendaContract = require('./tiendaContract');
module.exports.tiendaContract = tiendaContract;

const TokenERC20Contract = require('./tokenERC20');
module.exports.TokenERC20Contract = TokenERC20Contract;


module.exports.contracts = [tiendaContract, TokenERC20Contract];

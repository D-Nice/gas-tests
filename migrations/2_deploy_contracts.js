const contracts = [
	artifacts.require("GasABI.sol")
]
  module.exports = deployer =>
    contracts.map(contract => deployer.deploy(contract))

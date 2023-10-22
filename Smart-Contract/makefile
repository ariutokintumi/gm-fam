-include .env

.PHONY: all help install format anvil compile

DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

help:
	@echo "Makefile for Smart-Contract"
	@echo "Usage:"
	@echo "  make install    install dependencies"
	@echo "  make format     format code"
	@echo "  make anvil      run anvil"
	@echo "  make compile    compile contracts"
	@echo "  make deployTest deploy test contracts"
	@echo "  make deployAlbitrumTestnet deploy test contracts in Albitrum Sepolia testnet"

all: clean remove install update build

install:
	@echo "Not implemented yet"

format :; forge fmt

anvil :
	@echo "Starting Anvil, remember use another terminal to run tests"
	@anvil -m 'test test test test test test test test test test test junk' --steps-tracing

NETWORK_ARGS := --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY) --broadcast

ALBITRUM_TESTNET_ARGS := --rpc-url $(RPC_URL) --private-key $(PRIVATE) --broadcast --verify --etherscan-api-key $(API_KEY) -vvvv
compile:
	forge compile
deployTest:
	@echo "--==Deploying test contracts in anvil local testnet==--"
	@forge script script/DeployTest.s.sol:DeployTest $(NETWORK_ARGS)

deploy:
	@echo "--==Deploying test contracts in Albitrum goerli testnet==--"
	@forge script script/Deploy.s.sol:Deploy $(ALBITRUM_TESTNET_ARGS)

deployNFT:
	@echo "--==Deploying test contracts in Albitrum goerli testnet==--"
	@forge script script/DeployNFT.s.sol:DeployNFT $(ALBITRUM_TESTNET_ARGS)
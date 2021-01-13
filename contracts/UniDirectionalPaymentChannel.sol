// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";

contract UniDirectionalPaymentChannel is ReentrancyGuard {
    using SafeMath for uint256;
    using ECDSA for bytes32;

    address payable public payer;
    address payable public payee;

    uint256 public expiresAt;

    constructor(address payable _payee, uint256 _expiresAt) public payable {
        require(_expiresAt > block.timestamp, "Expiration must be > now");
        payer = msg.sender;
        payee = _payee;
        expiresAt = _expiresAt;
    }

    function getMessageHash(address _contract, uint256 _payeeBalance)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_contract, _payeeBalance));
    }

    function verify(
        bytes memory _signature,
        address _payer,
        address _contract,
        uint256 _payeeBalance
    ) public pure returns (bool) {
        return
            keccak256(abi.encodePacked(_contract, _payeeBalance))
                .toEthSignedMessageHash()
                .recover(_signature) == _payer;
    }

    modifier checkSignature(bytes memory _signature, uint256 _payeeBalance) {
        require(
            verify(_signature, payer, address(this), _payeeBalance),
            "Invalid signature"
        );
        _;
    }

    function close(uint256 _payeeBalance, bytes memory _signature)
        public
        nonReentrant
        checkSignature(_signature, _payeeBalance)
    {
        require(msg.sender == payee, "Not payee");
        (bool sent, ) = payee.call{ value: _payeeBalance }("");
        require(sent, "Failed to send Ether");
        selfdestruct(payer);
    }

    function kill() public {
        require(msg.sender == payer, "Not payer");
        require(block.timestamp >= expiresAt, "Channel not expired");
        selfdestruct(payer);
    }
}

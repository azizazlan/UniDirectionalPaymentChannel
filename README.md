<<<<<<< HEAD
# UniDirectionalPaymentChannel
A truffle test version of the smart contract from https://solidity-by-example.org/app/uni-directional-payment-channel/
=======
Payment channels allow participants to repeatedly transfer Ether off chain.

Here is how this contract is used:

JhoLow deploys the contract, funding it with some Ether.
JhoLow authorizes a payment by signing a message (off chain) and sends the signature to KakMah.
KakMah claims her payment by presenting the signed message to the smart contract.
If KakMah does not claim her payment, JhoLow get his Ether back after the contract expires
This is called a uni-directional payment channel since the payment can go only in a signle direction from JhoLow to KakMah.
>>>>>>> Initial commit.

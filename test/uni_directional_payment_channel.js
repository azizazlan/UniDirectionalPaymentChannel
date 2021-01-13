const { BN, ether } = require("openzeppelin-test-helpers");
var EthUtil = require("ethereumjs-util");
const UniDirectionalPaymentChannel = artifacts.require(
    "UniDirectionalPaymentChannel"
);

contract("UniDirectionalPaymentChannel", function(accounts) {
    let contract;
    let expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 3); // Expires 3 minutes from now
    expiresAt = expiresAt.getTime();

    const tenEther = ether("10"); // convert ether to wei
    const nineEther = ether("9"); // convert ether to wei
    const PAYEE = accounts[1];

    const PAYER_PRIVATEKEY =
        "0x0fe17f9cc22bb31eabf17ec5cd36d5d71aeab8d6e78312346239f11834b2c83d";
    // generate an account
    const PAYER = "0x893389758aAa16C0f974415E760b430e42214778";

    it("Give ether to payer and ensure payer have enough balance", async () => {
        await web3.eth.sendTransaction({
            to: PAYER,
            from: accounts[0],
            value: tenEther
        });

        const payerBal = await web3.eth.getBalance(PAYER);
        assert.isTrue(web3.utils.fromWei(payerBal, "ether") > 0);
    });

    it("Payer funds the contract with 9 Ether", async function() {
        contract = await UniDirectionalPaymentChannel.new(PAYEE, expiresAt, {
            from: PAYER,
            value: nineEther
        });

        let contractBal = await web3.eth.getBalance(contract.address);
        assert.equal(web3.utils.fromWei(contractBal, "ether"), 9);
        assert.equal(await contract.payer.call(), PAYER);
        assert.equal(await contract.payee.call(), PAYEE);
    });

    let signature;
    it("Payer sign off-chain", async () => {
        // get propoer hash message
        let hashMessage = await contract.getMessageHash(
            contract.address,
            ether("9")
        );

        // Payer sign it!
        signature = await web3.eth.accounts.sign(hashMessage, PAYER_PRIVATEKEY);

        const previousBal = await web3.eth.getBalance(PAYEE);
        // console.log(web3.utils.fromWei(previousBal, "ether"));

        await contract.close(ether("9"), signature.signature, {
            from: PAYEE
        });
        const finalBal = await web3.eth.getBalance(PAYEE);
        // console.log(web3.utils.fromWei(finalBal, "ether"));
    });
});

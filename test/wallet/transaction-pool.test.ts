import TransactionPool from "../../src/wallet/transaction-pool";
import Transaction from "../../src/wallet/transaction";
import Wallet from "../../src/wallet";

describe("TransactionPool", () => {
    let tp: TransactionPool, wallet: Wallet, transaction: Transaction;
    const RECIPIENT_ADDRESS: string = "r4nd-4ddr355";

    beforeEach(() => {
        tp = new TransactionPool();
        wallet = new Wallet();
        transaction = wallet.createOrUpdateTransaction(RECIPIENT_ADDRESS, 30, tp);
    })

    test("adds transaction to the pool - transaction doesn't exist in pool", () => {
        const foundTransaction = <Transaction> tp.transactions.find(
            t => t.id === transaction.id);
        const transactions: string = JSON.stringify(tp.transactions);

        expect(foundTransaction).toEqual(transaction);
    })

    test("updates transaction in the pool - transaction exists in pool", () => {
        const oldTxString: string = JSON.stringify(transaction);

        //modify the transaction
        const updatedTx = transaction.update(wallet, "foo-bar", 100);
        const updatedTxString: string = JSON.stringify(updatedTx);

        tp.updateOrAddTransaction(transaction);
        expect(oldTxString).not.toEqual(updatedTxString);

        const foundTx = <Transaction> tp.transactions.find(tx => tx.id === updatedTx.id);
        const foundTxString: string = JSON.stringify(foundTx);

        expect(oldTxString).not.toEqual(foundTxString);
        expect(updatedTxString).toEqual(foundTxString);
    })

    describe("mixing valid and corrupt transactoins - check that only valid transactions are mined", () => {
        let validTransactions : Transaction [];

        //make a series of valid and invalid transactions
        beforeEach(() => {
            validTransactions = [...tp.transactions]; //add existing valid transactions

            for(let i=0; i<10; i++) {
                wallet = new Wallet();
                transaction = wallet.createOrUpdateTransaction(RECIPIENT_ADDRESS, 50, tp);
                if(i%2 == 0) {
                    transaction.txInput.amount = 5000; //corrupt tx half the time
                }
                else if(i%3 == 0) {
                    transaction.txInput.signature = '{r:123456,s:7777,recoveryParam:1}'; //corrupt signature sometimes
                } else {
                    validTransactions.push(transaction); //create expected valid transactions
                }
            }
        })
        test("all transactions in pool (valid, invalid) are NOT equal to just valid transactions", () =>{
            expect(tp.transactions).not.toEqual(validTransactions);
        })

        test("valid transactions found", () => {
            expect(tp.validTransactions()).toEqual(validTransactions);
        })
    })
});
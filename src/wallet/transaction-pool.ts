import Transaction from "./transaction";

export default class TransactionPool {
    transactions: Transaction [];

    constructor() {
        this.transactions = [];
    }

    updateOrAddTransaction(transaction: Transaction): void {
        let foundTx: Transaction = <Transaction> this.transactions.find(tx => tx.id === transaction.id);

        //transaction already exists so it needs to replaced
        if(foundTx) {
            this.transactions[this.transactions.indexOf(foundTx)] = transaction;
        }
        //transaction doesn't exist already in the pool, so will be added
        else {
            console.log("TxPool>adding tx");
            this.transactions.push(transaction);
            console.log("TxPool>added tx");
        }

    }
}
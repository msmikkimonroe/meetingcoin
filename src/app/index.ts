import * as express from "express";
import * as bodyParser from "body-parser";

import Blockchain from "../blockchain";
import P2pServer from "./p2p-server";
import Wallet from "../wallet";
import TransactionPool from "../wallet/transaction-pool";
import Transaction from "../wallet/transaction";
import Miner from "./miner";

const HTTP_PORT: string = process.env.HTTP_PORT || "3001";

const app = express();
const blockchain: Blockchain = new Blockchain();
const wallet: Wallet = new Wallet();
const tp: TransactionPool = new TransactionPool();
const p2pServer: P2pServer = new P2pServer(blockchain, tp);
const miner = new Miner(blockchain, tp, wallet, p2pServer);

app.use(bodyParser.json());

//view all blocks on blockchain
app.get("/blocks", (request, response) => {
    response.json({blockchain: blockchain.chain});
});

app.get("/public-key", (request, response) => {
    response.json({publicKey: wallet.publicKey});
})

//view all transactions
app.get("/transactions", (request, response) => {
    response.json({transactions: tp.transactions});
})

//create a transaction with user's wallet and broadcast it to other nodes
app.post("/transact", (request, response) => {
    let recipient: string = request.body.recipient;
    let amount:number = request.body.amount;
    let transaction = wallet.createOrUpdateTransaction(recipient, amount, tp);
    p2pServer.broadcastTx(transaction);
    response.redirect("/transactions");
})

//add new block to blockchain
app.post("/mine", (request, response) => {
    const block = blockchain.addBlock(request.body.data);
    console.log("New block added: " + block.toString());

    //update other nodes as soon as new block mined
    p2pServer.syncChains();

    //show updated chain with new block
    response.redirect("/blocks");
});

app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
})

p2pServer.listen();
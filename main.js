const SHA256 = require('crypto-js/sha256');

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }
  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }
  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
      console.log('Mining: wrong answer ', this.hash);
    }
    console.log('Block mined:' + this.hash);
  }
}

class BlockChain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 1;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block('01/01/2023', 'Genesis Block', '0');
  }
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const block = new Block(Date.now(), this.pendingTransactions);
    block.previousHash = this.getLatestBlock().hash;
    block.mineBlock(this.difficulty);

    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward)
    ];
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }
        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }
    return balance;
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

const KaiCoin = new BlockChain();

KaiCoin.createTransaction(new Transaction('address1', 'address2', 100));
KaiCoin.createTransaction(new Transaction('address2', 'address3', 50));

KaiCoin.minePendingTransactions('miner-kai');
console.log(JSON.stringify(KaiCoin, null, 2));
console.log(KaiCoin.getBalanceOfAddress('miner-kai'));
console.log(KaiCoin.isChainValid(), ' isValid');

KaiCoin.createTransaction(new Transaction('address4', 'address3', 50));

KaiCoin.minePendingTransactions('miner-kai');
console.log(JSON.stringify(KaiCoin, null, 2));
console.log(KaiCoin.getBalanceOfAddress('miner-kai'));

KaiCoin.chain[1].transactions[1].amount = 10000;
console.log(JSON.stringify(KaiCoin, null, 2));
console.log(KaiCoin.isChainValid(), ' isValid');

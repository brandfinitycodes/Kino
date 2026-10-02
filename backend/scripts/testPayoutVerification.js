const mongoose = require('mongoose');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const CreatorProfile = require('../models/CreatorProfile');
const { getPendingWithdrawals, approveWithdrawal, rejectWithdrawal } = require('../controllers/adminController');
require('dotenv').config();

const runTest = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI not found in env configuration.');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // 1. Create a dummy creator user, profile, and wallet
    const testEmail = `test_creator_${Date.now()}@influencerhub.com`;
    const user = new User({
      email: testEmail,
      password: 'testPassword123',
      role: 'creator'
    });
    await user.save();
    console.log(`Created test user: ${user.email} (ID: ${user._id})`);

    const creatorProfile = new CreatorProfile({
      userId: user._id,
      name: 'Test Creator User',
      bio: 'Creating quality content.',
      niche: 'Tech',
      payoutDetails: {
        method: 'upi',
        upiId: 'test@upi',
        isComplete: true
      }
    });
    await creatorProfile.save();
    console.log('Created test creator profile.');

    const wallet = new Wallet({
      userId: user._id,
      balance: 1000,
      fundsSecured: 0
    });
    await wallet.save();
    console.log('Created test wallet with balance 1000.');

    // 2. Simulate Creator Payout Request
    // Balance is deducted and a pending transaction is created
    console.log('Simulating withdrawal request of 300...');
    wallet.balance -= 300;
    await wallet.save();

    const transaction = new Transaction({
      userId: user._id,
      amount: -300,
      type: 'coin_withdrawal',
      status: 'pending',
      description: 'Withdrawal to UPI'
    });
    await transaction.save();
    console.log(`Created pending withdrawal transaction: ${transaction._id}`);

    // Verify wallet balance is 700
    let updatedWallet = await Wallet.findOne({ userId: user._id });
    console.log(`Updated Wallet Balance: ${updatedWallet.balance} (Expected: 700)`);
    if (updatedWallet.balance !== 700) {
      throw new Error('Wallet balance deduction failed.');
    }

    // 3. Test getPendingWithdrawals controller
    console.log('Testing getPendingWithdrawals controller...');
    let getReq = {};
    let getRes = {
      jsonData: null,
      json: function(data) {
        this.jsonData = data;
        return this;
      },
      status: function(code) {
        this.statusCode = code;
        return this;
      }
    };
    await getPendingWithdrawals(getReq, getRes);

    const pendingList = getRes.jsonData;
    if (!Array.isArray(pendingList)) {
      throw new Error('getPendingWithdrawals did not return an array.');
    }
    console.log(`Pending withdrawals fetched: ${pendingList.length} items.`);
    const foundTx = pendingList.find(t => t._id.toString() === transaction._id.toString());
    if (!foundTx) {
      throw new Error('Test transaction not found in pending withdrawals list.');
    }
    console.log('Successfully retrieved test transaction from pending list.');
    if (foundTx.user.email !== testEmail || foundTx.user.name !== 'Test Creator User') {
      throw new Error('User details populate failed.');
    }
    console.log('User details populated correctly.');

    // 4. Test approveWithdrawal controller
    console.log('Testing approveWithdrawal controller...');
    let approveReq = { params: { id: transaction._id } };
    let approveRes = {
      jsonData: null,
      statusCode: 200,
      json: function(data) {
        this.jsonData = data;
        return this;
      },
      status: function(code) {
        this.statusCode = code;
        return this;
      }
    };
    await approveWithdrawal(approveReq, approveRes);
    
    if (approveRes.statusCode !== 200) {
      throw new Error(`approveWithdrawal failed with status ${approveRes.statusCode}`);
    }
    
    let dbTxAfterApprove = await Transaction.findById(transaction._id);
    console.log(`Transaction status after approval: ${dbTxAfterApprove.status} (Expected: completed)`);
    if (dbTxAfterApprove.status !== 'completed') {
      throw new Error('Transaction status was not updated to completed.');
    }

    // 5. Test rejectWithdrawal controller
    // Reset balance and create a new pending withdrawal
    console.log('Setting up second transaction for rejection testing...');
    updatedWallet.balance = 1000;
    await updatedWallet.save();

    updatedWallet.balance -= 400;
    await updatedWallet.save();

    const transaction2 = new Transaction({
      userId: user._id,
      amount: -400,
      type: 'coin_withdrawal',
      status: 'pending',
      description: 'Withdrawal to UPI'
    });
    await transaction2.save();
    console.log(`Created second pending transaction: ${transaction2._id}`);

    console.log('Testing rejectWithdrawal controller...');
    let rejectReq = { params: { id: transaction2._id } };
    let rejectRes = {
      jsonData: null,
      statusCode: 200,
      json: function(data) {
        this.jsonData = data;
        return this;
      },
      status: function(code) {
        this.statusCode = code;
        return this;
      }
    };
    await rejectWithdrawal(rejectReq, rejectRes);

    if (rejectRes.statusCode !== 200) {
      throw new Error(`rejectWithdrawal failed with status ${rejectRes.statusCode}: ${JSON.stringify(rejectRes.jsonData)}`);
    }

    let dbTxAfterReject = await Transaction.findById(transaction2._id);
    let dbWalletAfterReject = await Wallet.findOne({ userId: user._id });

    console.log(`Transaction status after rejection: ${dbTxAfterReject.status} (Expected: failed)`);
    console.log(`Wallet balance after rejection: ${dbWalletAfterReject.balance} (Expected: 1000 - refunded 400 to 600)`);
    
    if (dbTxAfterReject.status !== 'failed') {
      throw new Error('Transaction status was not updated to failed.');
    }
    if (dbWalletAfterReject.balance !== 1000) {
      throw new Error('Wallet balance was not refunded correctly on rejection.');
    }
    console.log('Rejection refund logic verified successfully.');

    // 6. Clean up test database documents
    console.log('Cleaning up test data...');
    await User.findByIdAndDelete(user._id);
    await CreatorProfile.findOneAndDelete({ userId: user._id });
    await Wallet.findOneAndDelete({ userId: user._id });
    await Transaction.findByIdAndDelete(transaction._id);
    await Transaction.findByIdAndDelete(transaction2._id);
    console.log('Test data cleaned up.');

    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
};

runTest();

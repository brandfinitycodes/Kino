const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const CreatorProfile = require('../models/CreatorProfile');

const getMyWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user.id });
    
    if (!wallet) {
      // Lazy create wallet if it doesn't exist
      wallet = new Wallet({ userId: req.user.id });
      await wallet.save();
    }
    
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestWithdrawal = async (req, res) => {
  const { amount, method, upiId, accountNumber, ifscCode, accountHolderName } = req.body;
  const withdrawAmount = Number(amount);

  if (!withdrawAmount || withdrawAmount <= 0) {
    return res.status(400).json({ message: 'Invalid withdrawal amount.' });
  }

  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    let creator = await CreatorProfile.findOne({ userId: req.user.id }).session(session);
    let payoutInfo = creator?.payoutDetails || {};

    // Save/update payout details if provided
    if (method || upiId || accountNumber || ifscCode || accountHolderName) {
      const selectedMethod = method || payoutInfo.method || 'upi';
      payoutInfo = {
        method: selectedMethod,
        accountHolderName: accountHolderName || payoutInfo.accountHolderName || '',
        bankAccountNumber: accountNumber || payoutInfo.bankAccountNumber || '',
        ifscCode: ifscCode ? ifscCode.toUpperCase() : (payoutInfo.ifscCode || ''),
        upiId: upiId || payoutInfo.upiId || '',
        isComplete: true
      };

      if (creator) {
        creator.payoutDetails = payoutInfo;
        await creator.save({ session });
      }
    }

    const isUpiValid = payoutInfo.method === 'upi' && payoutInfo.upiId;
    const isBankValid = payoutInfo.method === 'bank' && payoutInfo.bankAccountNumber && payoutInfo.ifscCode;

    if (!isUpiValid && !isBankValid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: 'Please provide valid payout details (UPI ID or Bank Account Number + IFSC Code).' 
      });
    }

    let wallet = await Wallet.findOne({ userId: req.user.id }).session(session);
    if (!wallet || wallet.balance < withdrawAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Insufficient wallet balance.' });
    }

    // Calculate 5% Platform Fee on withdrawal
    const platformFeeRate = 0.05; // 5%
    const platformFee = Math.round(withdrawAmount * platformFeeRate);
    const netPayoutAmount = withdrawAmount - platformFee;

    // Deduct full withdrawal amount from wallet balance
    wallet.balance -= withdrawAmount;
    await wallet.save({ session });

    // Target summary string
    const payoutTargetText = payoutInfo.method === 'upi' 
      ? `UPI: ${payoutInfo.upiId}` 
      : `Bank: ${payoutInfo.bankAccountNumber} (IFSC: ${payoutInfo.ifscCode})`;

    // Create pending coin_withdrawal transaction
    const tx = new Transaction({
      userId: req.user.id,
      amount: -withdrawAmount,
      type: 'coin_withdrawal',
      status: 'pending',
      description: `Withdrawal request of 🪙${withdrawAmount.toLocaleString()} (Net payout: ₹${netPayoutAmount.toLocaleString()} after 5% platform fee) to ${payoutTargetText}`
    });
    await tx.save({ session });

    // Note: We do not create a separate platform_fee_deducted transaction here because the gross withdrawal 
    // amount (withdrawAmount) has already been fully deducted from the wallet balance and recorded as a pending 
    // debit. Recording a second fee debit transaction on the creator's ledger results in double-counting 
    // (e.g., deducting 3000 + 150 coins from their transaction history sum). The platform fee is clearly 
    // documented inside the main withdrawal transaction's description.

    await session.commitTransaction();
    session.endSession();

    // In-App Notification
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: req.user.id,
        message: `Withdrawal request of 🪙${withdrawAmount.toLocaleString()} submitted. Net payout ₹${netPayoutAmount.toLocaleString()} via ${payoutTargetText}.`
      });
    } catch (notifErr) {
      console.error('Withdrawal notification error:', notifErr.message);
    }

    res.json({ 
      message: `Withdrawal request submitted successfully! Net payout: ₹${netPayoutAmount.toLocaleString()} (after 5% platform fee).`, 
      transaction: tx, 
      newBalance: wallet.balance,
      feeDetails: {
        grossAmount: withdrawAmount,
        platformFee,
        netPayoutAmount,
        payoutTarget: payoutTargetText
      }
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error('Withdrawal Request Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const addFunds = async (req, res) => {
  const { amount, method, referenceId } = req.body;
  const depositAmount = Number(amount);

  if (!depositAmount || depositAmount <= 0) {
    return res.status(400).json({ message: 'Invalid deposit amount.' });
  }

  if (!method || !referenceId) {
    return res.status(400).json({ message: 'Payment method and reference ID are required.' });
  }

  try {
    let wallet = await Wallet.findOne({ userId: req.user.id });
    
    if (!wallet) {
      wallet = new Wallet({ userId: req.user.id, balance: 0 });
      await wallet.save();
    }

    // Create pending coin_purchase transaction
    const tx = new Transaction({
      userId: req.user.id,
      amount: depositAmount,
      type: 'coin_purchase',
      status: 'pending',
      referenceId: referenceId,
      description: `Pending deposit request for ${depositAmount} Coins via ${method.toUpperCase()} (Ref: ${referenceId})`
    });
    await tx.save();

    res.json({ message: 'Deposit request submitted successfully. Awaiting admin approval.', transaction: tx, newBalance: wallet.balance });
  } catch (error) {
    console.error('Add Funds Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyWallet,
  getMyTransactions,
  requestWithdrawal,
  addFunds
};

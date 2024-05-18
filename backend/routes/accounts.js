const express = require('express');
const authMiddleware = require('../middleware');
const { Account } = require('../db');
const mongoose = require('mongoose');

const router = express.Router();

router.use(authMiddleware)

router.get('/balance', async (req, res, next)=>{    
    const account = await Account.findOne({
        userId : req.userId
    })
    res.json({
        balance: account.balance
    });
});


//Bad Solution
// router.post("/transfer", async (req, res) => {
//     const { amount, to } = req.body;

//     const account = await Account.findOne({
//         userId: req.userId
//     });

//     if (account.balance < amount) {
//         return res.status(400).json({
//             message: "Insufficient balance"
//         })
//     }

//     const toAccount = await Account.findOne({
//         userId: to
//     });

//     if (!toAccount) {
//         return res.status(400).json({
//             message: "Invalid account"
//         })
//     }

//     await Account.updateOne({
//         userId: req.userId
//     }, {
//         $inc: {
//             balance: -amount
//         }
//     })

//     await Account.updateOne({
//         userId: to
//     }, {
//         $inc: {
//             balance: amount
//         }
//     })

//     res.json({
//         message: "Transfer successful"
//     })
// });



// Using TRANSACTIONS

router.post('/transfer', async(req, res, next)=>{   
    const session = await mongoose.startSession();

    //Starting Transaction
    session.startTransaction();
    const { amount, to } = req.body;

    const account = Account.findOne({
        userId: req.userId
    }).session(session);

    if(!account || amount > account.balance){
        await session.abortTransaction();
        return res.status(400).json({msg: "Account not found or Insufficent balance"});
    }

    const toAccount = Account.findOne({
        userId: to
    }).session(session);

    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            msg: "Recevier account not found"
        });
    }

    await Account.updateOne({ userId: req.userId}, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to}, { $inc: { balance: amount } }).session(session);

    //commit the transaction
    await session.commitTransaction();
    res.json({
        msg: "Transaction complete"
    })
})

module.exports = router;


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjQ2ZGQ2NTNiZmFlNTYxOTgxZmZlOWYiLCJpYXQiOjE3MTU5MjAyMjl9.2AjnpnoVw77oieDmGKw66WUprzpJ2vEdm15gOJE-FoY
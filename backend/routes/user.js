const express = require('express');

const router = express.Router();
const z = require('zod');
const { User, Account } = require('../db');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware');
const jwt_secret = require('./../config');

// const JWT_SECRET = 'krishsecret';


const SignupSchema = z.object({
    username: z.string().email(),
    password: z.string().min(6),
    conpassword: z.string().min(6),
    firstname: z.string(),
    lastname: z.string()
});

const signinSchema = z.object({
    username: z.string().email(),
    password: z.string().min(6)
});

const updateSchema = z.object({
    password : z.string().optional(),
    firstname : z.string().optional(),
    lastname : z.string().optional(),
});  

router.post("/signup", async (req, res, next)=>{
    const { success } = SignupSchema.safeParse(req.body);
    // console.log(success);
    if(!success){
        console.log("In signup error");
        return res.status(411).json({msg:"Incorrect credentials"});
    }                       
    
    if(req.body.conpassword != req.body.password){
        return res.status(411).json({msg: "Confirm password does not match"});
    }

    const existingUser = await User.findOne({
        username : req.body.username    
    });

    if(existingUser){
        return res.status(411).json("Email already Linked");
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname
    });
    
    const hashedPass = await user.createHash(req.body.password);
    // console.log(hashedPass);
    
    const userId = user._id; 

    const account = await Account.create({
        userId,
        balance: 1+Math.random()*10000
    })
    // console.log(userId);
    // console.log(jwt_secret);
    const token = jwt.sign({userId}, jwt_secret);

    res.status(200).json({
        msg: "User registered",
        balance: account.balance,
        token: token
    });

});

router.post("/signin", async (req, res, next)=>{
    const { success } = signinSchema.safeParse(req.body);
    if(!success){
        return res.status(411).json({msg : "Invalid credentials"});
    } 

    const user = await User.findOne({
        username: req.body.username,
    });

    if(!user){
        return res.status(411).json({
            msg: "User not found"
        })
    }   

    const token = jwt.sign({
        userID: user._id
    }, JWT_SECRET);

    res.json({
        token: token
    });
    return;

});

router.put('/', authMiddleware, async (req, res, next)=>{
    const { success } = updateSchema.safeParse(req.body);
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

	await User.updateOne({ _id: req.userId }, req.body);

    res.json({
        message: "Updated successfully"
    });

});

router.get("/bulk", async(req, res, next)=>{
    const filter = req.query.filter || "";

    const users = await User.find({
        $or:[{
            firstname: {
                $regex: filter
            }
        },
        {
            lastname: {
                $regex: filter
            }
        }]
    })

    if(users){
        return res.json({
            user: users.map(user =>({
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                _id: user._id
            }))
        });
    }

    return res.status(411).json({
        msg: "User not found"
    })
})

module.exports = router;
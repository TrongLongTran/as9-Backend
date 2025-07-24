const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {verifyToken} = require('../middleware/auth')

const router = express.Router();

const JWT_SECRET = "whcgrh8wuhrcu83w9u8w99";

//Signup
router.post('/signup', async (req, res)=>{
    try{
        const {username, email, password} = req.body;

        const existingUser = await User.findOne({$or: [{username}, {email}]});
        if(existingUser)
            return res.status(409).json({error: 'Username or Email already taken'});

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({username, email, passwordHash});
        await newUser.save();

        const token = jwt.sign({userId: newUser._id}, JWT_SECRET);
        res.status(201).json({error: 'new user created'});
    }catch (err){
        console.error(err);
        res.status(500).json({error: 'Signup failed'});
    }
})

//Login
router.post('/login', async (req, res)=>{
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if(!user) return res.status(401).json({error: 'Invalid credentials One'});
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch) return res.status(401).json({error: 'Invalid credentials'});

        const token = jwt.sign({userId: user._id}, JWT_SECRET);
        // res.json({token});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7*24*60*60*1000
        }).json({user})
    }catch (err){
        console.error(err);
        res.status(500).json({error: 'Login Failed'});
    }
});

//get current user
router.get('/me', verifyToken, async (req, res)=>{
    const token = req.cookies.token;
    if (!token) return res.status(401).json({error: 'Missing token'});

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('username email createdAt');
        res.json(user);
    }catch{
        res.status(401).json({error: 'Invalid token'});
    }
});

router.post('/logout', (req, res)=>{
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });
    res.json({message: "Logged out successfully"})
})

module.exports = router;
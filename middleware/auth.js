const jwt = require('jsonwebtoken');
const JWT_SECRET = "whcgrh8wuhrcu83w9u8w99";

function verifyToken(req, res, next){
    const token = req.cookies.token;
    if (!token){console.log(req.headers.authorization); return res.status(401).json({error: 'Missing token'})};

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }catch{
        res.status(401).json({error: 'Invalid token'});
    }
}

module.exports = {verifyToken};
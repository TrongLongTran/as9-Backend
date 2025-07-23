const express = require('express');
// const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
// let flights = require('../data/flights.js');
// const e = require('express');
const Flight = require('../models/Flights.js');
const { verifyToken } = require('../middleware/auth.js');

const limiter = rateLimit({
    windowMs: 15*60*100,
    max: 100,
    message: "Too many reqs, try again"
})

router.use(limiter);

// router.get('/:id', (req, res)=>{
//     const data = flights.find(f=>String(f.id)==req.params.id);
//     if (!data){
//         return res.status(404).json({error: 'Not found'})
//     }else{
//         res.json(data)
//     }
// })

// router.get('/', (req, res)=>{
//     const { from, to } = req.query;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 5;

//     let filtered = flights;
//     if(from){
//         filtered = filtered.filter(f=>
//             f.from.toLowerCase() === from.toLowerCase()
//         );
//     }

//     if(to){
//         filtered = filtered.filter(f=>
//             to.toLowerCase() === f.to.toLowerCase()
//         );
//     }
//     const start = (page-1)*limit;
//     const paginated = filtered.slice(start, start+limit);

//     res.json({
//         total: filtered.length,
//         page,
//         limit,
//         data: paginated
//     })

// })

// router.post("/",
//     body("from").notEmpty(),
//     body("to").notEmpty(),
//     body("airline").notEmpty(),
//     body("duration").notEmpty(),
//     body("price").isNumeric(),
//     body("departureTime").isISO8601(),
//     (req, res)=>{
//         const error = validationResult(req);
//         if (!error.isEmpty()) return res.status(400).json({errors: error.array()})

//         const newData = {id: Date.now(), ...req.body}
//         flights.push(newData);
//         res.status(201).json(newData);
// })


router.get('/', async (req, res) => {
try {
const { from, to } = req.query;
const filter = {};
if (from) filter.from = from;
if (to) filter.to = to;
const flights = await Flight.find(filter);
res.json(flights.map(f => ({ ...f._doc, id: f._id })));
} catch (err) {
res.status(500).json({ error: 'Failed to fetch flights'
});
}
});

router.get('/:id', verifyToken, async (req, res) => {
try {
const f = await Flight.findById(req.params.id);
f ? res.json({ ...f._doc, id: f._id }) :
res.status(404).json({ error: 'Flight not found' });
} catch {
res.status(400).json({ error: 'Invalid ID' });
}
});

router.post('/', async (req, res) => {
try {
const newFlight = new Flight(req.body);
const saved = await newFlight.save();
res.status(201).json({ ...saved._doc, id: saved._id });
} catch {
res.status(400).json({ error: 'Invalid input' });
}
});

router.delete('/:id', async (req, res) => {
try {
const deleted = await
Flight.findByIdAndDelete(req.params.id);
deleted ? res.json({ message: 'Flight deleted' }) :
res.status(404).json({ error: 'Not found' });
} catch {
res.status(400).json({ error: 'Invalid ID' });
}
});


module.exports = router;
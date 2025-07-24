const express = require('express');
const cors = require('cors');
const flightsRouter = require('./routes/flights');
// const flightsRouter = require('./seed.js');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.js')
const cookieParser = require('cookie-parser')
dotenv.config();

mongoose.connect(process.env.MOONGGODB_DTB)
.then(()=>console.log("Connected to MongoDB Atlas"))
.catch((err)=>console.error("Something wrong with mongo", err));

const app = express();

app.use(cookieParser())
// cors is used to make our server indicate to any origin Cross-origin resource sharing
app.use(cors({
//     origin: 'https://front-e2nd-data-react-onncivzzc.vercel.app',  //front-end
//     credentials: true
// }, 
// {
//every deploy on vercel will create a new endpoint
    origin: ['http://localhost:5173', 'https://front-e2nd-data-react-3eyrd9kmb.vercel.app'],
    credentials: true
}));
app.use(express.json());
app.use('/flights', flightsRouter);
app.use('/api/auth', authRoutes);

app.listen(4000, ()=>{
    console.log("REST api is running at http://localhost:4000");
})

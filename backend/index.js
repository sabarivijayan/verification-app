const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./Routes/userRoutes');
const mongoose = require('mongoose');
const cors = require('cors')

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended: true}));


// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log(err))


// Routes
app.use('/api/users', userRoutes);

app.get('/', (req,res) => {
  res.json({
    message: 'Welcome to the Verification app',
  });
});

app.use((err,req,res,next)=>{
  console.error(err.stack);
  res.status(500).json({message: 'Something broke!'});
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

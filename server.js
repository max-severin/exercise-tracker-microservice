const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const port = 3000;

require('dotenv').config();



mongoose.connect(
  process.env.MONGO_URI, 
  { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  }
);

mongoose.connection.on(
  'error', 
  console.error.bind(console, 'connection error:')
);

mongoose.connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true },
});

const userModel = mongoose.model('user', userSchema);



app.use(cors());

app.use(express.static(`${__dirname}/public`));

app.use(bodyParser.urlencoded({extended: false}));



app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/view/index.html`)
});

app.post('/api/users/', async (req, res) => {
  try {
    const existedUser = await userModel.findOne({
      username: req.body.username
    });
    
    if (existedUser) {
      res.status(400).json({
        message: 'Username is already in use'
      });
    } else {
      const newUser = new userModel({
        username: req.body.username
      });

      await newUser.save();

      res.json({
        _id: newUser._id,
        username: newUser.username,
      });
    }
  } catch(error) {
    res.status(500).json({
      error,
      message: 'Server error'
    });
  }
});



const listener = app.listen(port || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
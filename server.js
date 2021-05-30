const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const port = 3000;

require('dotenv').config();


mongoose.connection.on(
  'error', 
  console.error.bind(console, 'connection error:')
);

mongoose.connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

const connectDb = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI, 
      { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );
  } catch(error) {
    console.error(error);
  }
};

connectDb();

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true },
  exercises: [{
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, required: true },
  }],
});

const userModel = mongoose.model('user', userSchema);



app.use(cors());

app.use(express.static(`${__dirname}/public`));

app.use(bodyParser.urlencoded({extended: false}));



app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/view/index.html`)
});

app.get('/api/users/', async (req, res) => {
  const users = await userModel.find();

  res.json(users);
});

app.post('/api/users/', async (req, res) => {
  try {
    const existedUser = await userModel.findOne({
      username: req.body.username,
    });
    
    if (existedUser) {
      res.status(400).json({
        message: 'Username is already in use'
      });
    } else {
      const newUser = new userModel({
        username: req.body.username,
        exercises: [],
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

app.get('/api/users/:_id/logs', async (req, res) => {
  try {    
    const existedUser = await userModel.findOne({ _id: req.params._id });

    if (existedUser) {
      res.json({
        _id: existedUser._id,
        username: existedUser.username,
        count: existedUser.exercises.length,
        log: existedUser.exercises.map((exercise) => ({
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date,
        })),
      });
    } else {
      res.status(404).json({
        message: 'User id is not found'
      });
    }
  } catch(error) {
    res.status(500).json({
      error,
      message: 'Server error'
    });
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { description, duration, date } = req.body;

    let dateValid = new Date();

    if (typeof date !== 'undefined' && date !== '' && new Date(date) !== 'Invalid Date') {
      dateValid = new Date(date);
    }
    
    const newExercise = {
      description: description,
      duration: parseInt(duration),
      date: dateValid,
    };
    
    const existedUser = await userModel.findOneAndUpdate(
      { _id: req.params._id }, 
      { $push: { exercises: newExercise } },
      { new: true }
    );

    if (existedUser) {
      res.json({
        _id: existedUser._id,
        username: existedUser.username,
        description: description,
        duration: parseInt(duration),
        date: dateValid.toDateString(),
      });
    } else {
      res.status(404).json({
        message: 'User id is not found'
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
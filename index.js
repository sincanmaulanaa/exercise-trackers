const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// In-memory storage
const users = [];
const exercises = [];

// Helper function to find a user by ID
const findUserById = (id) => users.find((user) => user._id === id);

// POST /api/users: Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const _id = Date.now().toString(); // Generate a unique ID using timestamp
  const newUser = { username, _id };
  users.push(newUser);
  res.json(newUser);
});

// GET /api/users: Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// POST /api/users/:_id/exercises: Add an exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = findUserById(_id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const exerciseDate = date ? new Date(date) : new Date();
  const newExercise = {
    userId: _id,
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
  };
  exercises.push(newExercise);

  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id,
  });
});

// GET /api/users/:_id/logs: Get user log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = findUserById(_id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises.filter((exercise) => exercise.userId === _id);

  // Apply filters
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(
      (exercise) => new Date(exercise.date) >= fromDate
    );
  }
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(
      (exercise) => new Date(exercise.date) <= toDate
    );
  }
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
    })),
  });
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

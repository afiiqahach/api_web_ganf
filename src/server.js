const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { error } = require('./api/middlewares/error');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

routes.forEach((route) => {
  app.use(route.path, route.api);
});

app.use(error);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require('express');

const app = async function () {
  const server = express();
  const PORT = 3000;

  server.use(express.static('public'));

  server.get('/', (req, res) => {
    res.send('Hello World!');
  });

  try {
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

app();

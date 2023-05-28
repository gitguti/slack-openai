const app = require('./app.js');

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log('mi port', port);
});

module.exports = app;
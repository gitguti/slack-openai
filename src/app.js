const express = require('express');
const app = express();
const routerApi = require('./routes');
// const swaggerUi = require('swagger-ui-express');
// const swaggerDocs = require('./swagger-output.json');
// const { doc_json } = require('./documentation')

// const {
//     logErrors,
//     errorHandler,
//     boomErrorHandler,
//     ormErrorHandler
// } = require('./middlewares/error.handler')

app.use(express.json());
// require('./utils/auth');
// app.use('/api-docs',
//   swaggerUi.serve,
//   swaggerUi.setup(doc_json)
// );
routerApi(app);

// app.use(logErrors);
// app.use(ormErrorHandler);
// app.use(boomErrorHandler);
// app.use(errorHandler);

module.exports = app
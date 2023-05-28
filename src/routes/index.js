const express = require('express');
const routes = require('./routes.router');

const routerApi = (app) => {
    const router = express.Router();
    app.use(router);
    router.use("", routes);
}

module.exports = routerApi;
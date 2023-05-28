const express = require('express');
const MainService = require('../services/main.service');

router = express.Router();

const mainService = new MainService();

router.get('/', async (req, res, nex) => {
    try{
        const {message} = req.body;
        const response = await mainService.main(message);
        res.status(response.status).json(response.response);
    }
    catch (error) {
        console.error(error);
    }
})

module.exports = router;
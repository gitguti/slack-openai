const express = require('express');

router = express.Router();

router.get('/', async (req, res, nex) => {
    try{
        res.status(200).json({ result: "Hola endi naricita loca!" });
    }
    catch (error) {
        console.error(error);
    }
})

module.exports = router;
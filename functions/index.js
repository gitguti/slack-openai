const functions = require("firebase-functions");
const main = require("./services/main.service");

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

// eslint-disable-next-line max-len
exports.myFirebaseFunction = functions.https.onRequest(async (request, response) => {
  try {
    const {message} = request.body;
    const result = await main(message);
    response.send(result.response);
  } catch (error) {
    console.error(error);
    response.status(500).json({result: "Error en el servidor"});
  }
});

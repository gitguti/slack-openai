const {Configuration, OpenAIApi} = require("openai");
const {App} = require("@slack/bolt");
require("dotenv").config();

// OpenAI API configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Slack App configuration
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000,
});

const findKeyword = async (message) => {
  const keyword = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "Extract keywords from this text: \n\n" + message,
    temperature: 0.5,
    max_tokens: 60,
    top_p: 1.0,
    frequency_penalty: 0.8,
    presence_penalty: 0.0,
  });
  return keyword.data.choices[0].text;
};
// eslint-disable-next-line require-jsdoc
const findSentiment = async (message) => {
  const sentiment = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "Classify the sentiment in these tweets:\n\n" + message,
    temperature: 0,
    max_tokens: 60,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });
  return sentiment.data.choices[0].text;
};

const generateResume = async (message) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    // eslint-disable-next-line max-len
    prompt: "Provide a concise summary of the following messages:\n\n" + message,
    temperature: 0.5,
    max_tokens: 300,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,

  });
  return response.data.choices[0].text;
};

// Slack Slash Command Handler
app.command("/openai", async ({command, ack, client}) => {
  // Acknowledge command request
  await ack();

  try {
    // Obtener la fecha y hora actual
    const now = new Date();
    // Restar 10 minutos a la fecha y hora actual
    const tenMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Obtener los mensajes del canal en los últimos 10 minutos
    const result = await client.conversations.history({
      channel: command.channel_id,
      latest: Math.floor(now.getTime() / 1000),
      oldest: Math.floor(tenMinutesAgo.getTime() / 1000),
    });

    // Extraer los textos de los mensajes
    const messages = result.messages.map((message) => message.text);

    // Concatenar todos los mensajes en un solo texto
    const allMessages = messages.join("\n");

    // Generar el resumen del texto completo
    const summary = await generateResume(allMessages);

    // Enviar el resumen al canal
    await client.chat.postMessage({
      text: `Resumen de los mensajes de los últimos 10 minutos:\n\n${summary}`,
      channel: command.channel_id,
    });
  } catch (error) {
    console.error("Error al obtener los mensajes del canal:", error);
  }
});


// // Slack Slash Command Handler
// app.command("/openai", async ({command, ack, client}) => {
//   // Acknowledge command request
//   await ack();

//   // Respond with message to user
//   const articleMessage = await client.chat.postMessage({
//     // eslint-disable-next-line max-len
//     text: `:hourglass: *Generating Blog Article* - [
// Your Input: ${command.text}]`,
//     channel: command.channel_id,
//   });
//     // Generate Article
//   const article = await main(command.text);
//   // Get message timestamp from response
//   const messageTimestamp = articleMessage.ts;
//   // Update Message with Article
//   await client.chat.update({
//     channel: command.channel_id,
//     ts: messageTimestamp,
//     text: `*Resume Generated* :white_check_mark:
//     resumen: ${article.response.resume},
//     keywords: ${article.response.keywords},
//     sentimientos: ${article.response.sentiment}`,
//   });
// });

// // Slack Slash Command Handler
// app.command("/openai", async ({command, ack, client}) => {
//   // Acknowledge command request
//   await ack();

//   try {
//     // Obtener la fecha de hace 10 minutos
//     const tenMinutesAgo = Math.floor(Date.now() / 1000) - (10 * 60);
//     // Obtener la marca de tiempo de hace 10 minutos

//     // Obtener los mensajes del canal en las últimas 6 horas
//     const result = await client.conversations.history({
//       channel: command.channel_id,
//       latest: tenMinutesAgo.toString(),
//     });

//     // Extraer los textos de los mensajes
//     const messages = result.messages.map((message) => message.text);

//     // Concatenar todos los mensajes en un solo texto
//     const allMessages = messages.join("\n");

//     // Generar un resumen del texto completo
//     const summary = await generateResume(allMessages);

//     // Enviar el resumen al canal
//     await client.chat.postMessage({
//     text: `Resumen de los mensajes de las últimos 10 minutos:\n\n${summary}`,
//       channel: command.channel_id,
//     });
//   } catch (error) {
//     console.error("Error al obtener los mensajes del canal:", error);
//   }
// });


(async () => {
  // Start your app
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();


const main = async (message) => {
  try {
    const keywords = await findKeyword(message);
    const sentiment = await findSentiment(message);
    const resume = await generateResume(message);
    return {response: {keywords, sentiment, resume}, status: 200};
  } catch (error) {
    if (error) {
      return {response: {result: error}, status: 500};
    }
    return {response: {result: "esta temblando"}, status: 500};
  }
};

module.exports = main;
// class MainService {
//   // eslint-disable-next-line require-jsdoc
//   async main(message) {
//     try {
//       const keywords = await this.findKeyword(message);
//       const sentiment = await this.findSentiment(message);
//       return {response: {keywords, sentiment}, status: 200};
//     } catch (error) {
//       if (error) {
//         return {response: {result: error}, status: 500};
//       }
//       return {response: {result: "esta temblando"}, status: 500};
//     }
//   }
//   // eslint-disable-next-line require-jsdoc
//   async findKeyword(message) {
//     const keyword = await openai.createCompletion({
//       model: "text-davinci-003",
//       prompt: "Extract keywords from this text: \n\n" + message,
//       temperature: 0.5,
//       max_tokens: 60,
//       top_p: 1.0,
//       frequency_penalty: 0.8,
//       presence_penalty: 0.0,
//     });
//     return keyword.data.choices[0].text;
//   }
//   // eslint-disable-next-line require-jsdoc
//   async findSentiment(message) {
//     const sentiment = await openai.createCompletion({
//       model: "text-davinci-003",
//       prompt: "Classify the sentiment in these tweets:\n\n" + message,
//       temperature: 0,
//       max_tokens: 60,
//       top_p: 1.0,
//       frequency_penalty: 0.0,
//       presence_penalty: 0.0,
//     });
//     return sentiment.data.choices[0].text;
//   }
// }

// module.exports = MainService;

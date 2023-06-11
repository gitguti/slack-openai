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

// eslint-disable-next-line require-jsdoc
const findSentiment = async (message) => {
  const sentiment = await openai.createCompletion({
    model: "text-davinci-003",
    // eslint-disable-next-line max-len
    prompt: "Classify the sentiment between 'positive' or 'negative' in this message:" + message,
    temperature: 0,
    max_tokens: 20,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });
  let sentimentText = sentiment.data.choices[0].text.trim().toLowerCase();
  if (sentimentText.endsWith(".")) {
    sentimentText = sentimentText.slice(0, -1);
    // Eliminar el último carácter (el punto)
  }
  return sentimentText;
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

// Escuchar el evento de mensaje en un canal
app.event("message", async ({event, client}) => {
  try {
    // Verificar si el mensaje es de tipo "message" y no proviene del bot
    if (event.type === "message" && !event.bot_id) {
      // Obtener el mensaje y realizar el análisis de sentimiento
      const message = event.text;
      const sentiment = await findSentiment(message);

      // Reactuar al mensaje basado en el sentimiento
      if (sentiment === "positive") {
        await client.reactions.add({
          token: process.env.SLACK_BOT_TOKEN,
          name: "thumbsup",
          channel: event.channel,
          timestamp: event.ts,
        });
      } else if (sentiment === "negative") {
        await client.reactions.add({
          token: process.env.SLACK_BOT_TOKEN,
          name: "thumbsdown",
          channel: event.channel,
          timestamp: event.ts,
        });
      }
    }
  } catch (error) {
    console.error("Error al procesar el mensaje:", error);
  }
});

(async () => {
  // Start your app
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();


const main = async (message) => {
  try {
    const sentiment = await findSentiment(message);
    const resume = await generateResume(message);
    return {response: {sentiment, resume}, status: 200};
  } catch (error) {
    if (error) {
      return {response: {result: error}, status: 500};
    }
    return {response: {result: "esta temblando"}, status: 500};
  }
};

module.exports = main;

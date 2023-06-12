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
    prompt: "Analyze the sentiment of the following message and classify it as 'positive' or 'negative':" + message,
    temperature: 0,
    max_tokens: 20,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });
  let sentimentText = sentiment.data.choices[0].text.trim().toLowerCase();
  if (sentimentText.endsWith(".")) {
    sentimentText = sentimentText.slice(0, -1);
    // Delete last character if it's a dot
  }
  return sentimentText;
};

const generateResume = async (message) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    // eslint-disable-next-line max-len
    prompt: "Provide a concise summary of the following messages containing feedback from the channel. These messages have been filtered by Reacji Channeler:\n\n" + message,
    temperature: 0.2,
    max_tokens: 300,
    top_p: 1.0,
    frequency_penalty: 0.2,
    presence_penalty: 0.2,

  });
  return response.data.choices[0].text;
};

// Slack Slash Command Handler
app.command("/openai", async ({command, ack, client}) => {
  // Acknowledge command request
  await ack();
  try {
    // Get curernt date and time
    const now = new Date();
    // Subtract 30 minutes from the current date and time
    const tenMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    // Get channel messages in the last 30 minutes
    const result = await client.conversations.history({
      channel: command.channel_id,
      latest: Math.floor(now.getTime() / 1000),
      oldest: Math.floor(tenMinutesAgo.getTime() / 1000),
    });
    // Extract message texts
    const messages = result.messages.map((message) => message.text);
    // Concatenate all messages into a single text
    const allMessages = messages.join("\n");
    // Generate full text abstract
    const summary = await generateResume(allMessages);
    // Send the summary to the channel
    await client.chat.postMessage({
      text: `Resumen de los mensajes de los últimos 30 minutos:\n\n${summary}`,
      channel: command.channel_id,
    });
  } catch (error) {
    console.error("Error al obtener los mensajes del canal:", error);
  }
});

// Listen to the message event in a channel
app.event("message", async ({event, client}) => {
  try {
    // Check if the message is of type "message" and does not come from the bot
    if (event.type === "message" && !event.bot_id) {
      // Get the message and perform sentiment analysis
      const message = event.text;
      const sentiment = await findSentiment(message);

      // React to message based on sentiment
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
    return {response: {result: error}, status: 500};
  }
};

module.exports = main;

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

// Slack Slash Command Handler
app.command("/openai", async ({command, ack, client}) => {
  // Acknowledge command request
  await ack();

  // Respond with message to user
  const articleMessage = await client.chat.postMessage({
    // eslint-disable-next-line max-len
    text: `:hourglass: *Generating Blog Article* - [Your Input: ${command.text}]`,
    channel: command.channel_id,
  });
    // Generate Article
  const article = await main(command.text);
  // Get message timestamp from response
  const messageTimestamp = articleMessage.ts;
  // Update Message with Article
  await client.chat.update({
    channel: command.channel_id,
    ts: messageTimestamp,
    text: `*Article Generated* :white_check_mark: ${article}`,
  });
});

(async () => {
  // Start your app
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();


const main = async (message) => {
  try {
    const keywords = await findKeyword(message);
    const sentiment = await findSentiment(message);
    return {response: {keywords, sentiment}, status: 200};
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

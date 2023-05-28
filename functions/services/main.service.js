const {Configuration, OpenAIApi} = require("openai");

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

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
const findSentiment = async (message) =>{
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

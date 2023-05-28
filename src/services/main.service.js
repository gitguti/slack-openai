const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: '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'
  ,
});
const openai = new OpenAIApi(configuration);

class MainService {
    async main () {
        try {
            console.log("Inicio de respuesta");
            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: "Say this is a test",
                temperature: 0,
            });
            console.log("Esta es la respuesta", completion.data.choices[0].text);
            return ({ response: completion.data.choices[0].text, status: 200 });
        }
        catch(error) {
            if(error) {
                return { response: { result: error}, status: 500}
            }
            return ({response: {result: "esta temblando"}, status: 500})
        }
    }
}

module.exports = MainService;
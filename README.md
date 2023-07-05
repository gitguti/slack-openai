# Slack-Open AI Integration

This project aims to provide seamless integration between the OpenAI API and the Slack platform. It was developed with a focus on user customer feedback analysis. The workflow involves automatically classifying incoming messages as positive or negative and providing a summary of the messages from the last 30 minutes upon request.

## Getting Started

To run the project locally, follow these steps:

1. Clone the repository to your local machine.
2. Modify the `.env` file with your own Slack and OpenAI API keys. 
   - To obtain your keys, visit: [Where do I find my Secret API Key?](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key).
   - Also, you will need to associate with Slack the User token (xoxp), App-level token bot (xoxb) and Bot token (xapp). Visit for more info: [Getting started with Bolt for JavaScript](https://slack.dev/bolt-js/tutorial/getting-started).
3.The function is hosted by the google cloud platform. So you will need to create an account there and deploy.
5. Start the server using the command `node index.js` in the functions directory.
6. The project should now be up and running locally.

You can validate your connection on localhost with Insomnia (this is what I use)

## Slack Setup

To add the bot to your Slack workspace, please follow these instructions:

1. Create a new channel in your Slack workspace.
2. Add the bot to your workspace. (Instructions for adding custom integrations can be found in the Slack documentation.)
3. Configure the following permissions for the bot to ensure proper functionality:
   - channels:history: [View messages and other content in public channels that costumer-feedback has been added to]
   - chat:write: [Send messages as @costumer-feedback]
   - reactions:read: [View emoji reactions and their associated content in channels and conversations that costumer-feedback has been added to]
   - reactions:write: [Add and edit emoji reactions]
4. Add the bot to the desired channel where you want it to be active.

## Usage

Once the project is running and the bot is added to your Slack workspace, you can start using the integration. The bot will automatically classify incoming messages as positive or negative. Additionally, you can request the bot to provide a summary of the messages from the last 30 minutes.

## Demo
https://www.youtube.com/watch?v=yZcC1QiGeEo&t=1s

## Contributing

Contributions to this project are welcome. If you encounter any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

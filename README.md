# adopt-a-tree-chatbot
Messenger Chatbot for the Adopt-a-tree website

### Basic Flow Outline
Client sends a message on the messenger app to the chatbot →
Facebook Messenger Platform fires an event →
Webhook is notified with the event →
Our backend code receives the event details and we can send response to the sender by calling a HTTP Post to Messenger Platform.

### To run this app you will need the following:

1. Facebook developer account
2. Facebook developer app a webhook configured to the server url
3. Facebook Page
4. A server that has Node.js installed

### Setting Up the Webhook
This repo contains code for the webhook and application logic for an example Messenger bot. To run it, do the following:

- Download this repo
- Deploy the repo to your server
- Create a `.env` file with the following strings:

```bash
MONGODB_URI=
VERIFY_TOKEN=
PERSONA_ID=
PAGE_ACCESS_TOKEN=
```
- Fill in the environment variables with the appropriate info
- Run `npm install` within the directory
- Run `npm start` to start the webhook
- Configure the webhook in your Facebook app settings
- Subscribe the Facebook app to receive webhook events for your page

### Starting up the bot
1. The get started page
[!alt text](images/65418013_375678703306083_7224173466189037568_n.png)
2. Welcome message
[!alt text](images/64957233_391524055040997_4572322183598047232_n.png)
3. Carousel menu
[!alt text](images/66109575_378249679483842_6692281516501762048_n.png)
4. `No thanks` diverts to a prompt to visit the website
[!alt text](images/65517000_429667014297158_4027181453803520000_n.png)
4. Speak to a live agent through page inbox
[!alt text](images/65768934_2462632730423490_5742930964825243648_n.png)
5. Click done on Page Inbox on the Facebook page to divert sender back to bot
[!alt text](images/done.png)

## Contributors
@ogambakerubo

## License
[MIT](https://choosealicense.com/licenses/mit/)

#### Youtube Video
[!alt text](https://youtu.be/Y3DTvBaDr0c)
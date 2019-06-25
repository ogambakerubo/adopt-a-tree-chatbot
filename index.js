/**
 * Messenger Platform Adopt-a-tree
 */

'use strict';
require("dotenv").config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GET_STARTED_PAYLOAD = "GET_STARTED_PAYLOAD";
const FACEBOOK_GRAPH_API = "https://graph.facebook.com/v2.6/";
const INSTRUCTIONS = "At any time, use the menu provided to navigate through the features.";
const START_SEARCH_NO = "START_SEARCH_NO";
const START_SEARCH_YES = "START_SEARCH_YES";
const MONGODB_URI = process.env.MONGODB_URI;

// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  mongoose = require('mongoose'),
  app = express(); // Creates express http server
app.use(body_parser.json()); // Parses json requests

// eslint-disable-next-line no-unused-vars
var db = mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}); // Connect to MongoDB
var ChatStatus = require("./models/chatstatus");

// Sets server port and logs message on success
const server = app.listen(process.env.PORT || 5000, () => {

  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);

});

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry
    // There may be multiple if batched
    if (body.entry && body.entry.length <= 0) {

      return;

    }

    body.entry.forEach(entry => {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging;

      // Iterate over each webhook_event and handle accordingly
      webhook_event.forEach(event => {

        // Log event
        console.log({
          event
        });

        // Get the sender PSID
        let sender_psid = event.sender.id;
        console.log('Sender ID: ' + sender_psid);

        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (event.message) {

          if (event.message.quick_reply) {
            postbackHandler(sender_psid, event.message.quick_reply);

          } else {
            messageHandler(sender_psid, event.message);

          }

        } else if (event.postback) {

          postbackHandler(sender_psid, event.postback);

        }

      })


    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {

    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);

  }

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {

  // Use environment vars
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {

    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {

      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);

    }

  }
});

function greetingPostbackHandler(sender_psid) {

  // send request to fb graph api to get client first name
  request({
    url: `${FACEBOOK_GRAPH_API}${sender_psid}`,
    qs: {
      access_token: process.env.PAGE_ACCESS_TOKEN,
      fields: "first_name"
    },
    method: "GET"
  }, (error, msgbody) => {

    // Callback function
    var greeting;
    if (error) {

      console.log("Error getting user's name: " + error);

    } else {
      console.log("Body object:", msgbody.body);
      // Parse client's first name
      var bodyObj = JSON.parse(msgbody.body);
      const name = bodyObj.first_name;
      greeting = "Hi " + name + "! "; // Custom greeting

    }
    const message = greeting + "Now you can begin the journey of adopting your very own tree 🎉";
    // Create quick reply options
    const greetingPayload = {
      "text": message,
      "quick_replies": [{
          "content_type": "text",
          "title": "Continue",
          "payload": START_SEARCH_YES
        },
        {
          "content_type": "text",
          "title": "No, thanks.",
          "payload": START_SEARCH_NO
        }
      ]
    };
    // Send the response message to acknowledge the payload
    callSendAPI(sender_psid, greetingPayload);
  });
}

function continuePostbackHandler(sender_psid) {

  // This handles the START_SEARCH_YES payload
  // Create carousel of generic templates and response messages
  const mssg = {
    "text": "We have some great options for you"
  };
  const instruct = {
    "text": INSTRUCTIONS
  };
  console.log("continue: CONTINUEPOSTBACKHANDLER");
  const continuePayload = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
          {
            "title":"Acacia Seedling",
            "image_url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/images/seedling.jpg",
            "subtitle":"Location: Haller Park, Mombasa\nUSD $2.00",
            "default_action": {
              "type": "web_url",
              "url": "https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/",
                "title":"View Website"
              },{
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
                "title":"Adopt me!"
              }              
            ]      
          }, {
            "title":"Mahogany Seedling",
            "image_url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/images/seedling.jpg",
            "subtitle":"Location: Haller Park, Mombasa\nUSD $1.00",
            "default_action": {
              "type": "web_url",
              "url": "https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/",
                "title":"View Website"
              },{
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
                "title":"Adopt me!"
              }              
            ]      
          }, {
            "title":"Cedar Seedling",
            "image_url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/images/seedling.jpg",
            "subtitle":"Location: Naivas Supermarket, Mombasa\nUSD $2.00",
            "default_action": {
              "type": "web_url",
              "url": "https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/",
                "title":"View Website"
              },{
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
                "title":"Adopt me!"
              }              
            ]      
          }, {
            "title":"White Oak Seedling",
            "image_url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/images/seedling.jpg",
            "subtitle":"Location: Makupa Round About, Mombasa\nUSD $4.00",
            "default_action": {
              "type": "web_url",
              "url": "https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/",
                "title":"View Website"
              },{
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
                "title":"Adopt me!"
              }              
            ]      
          }, {
            "title":"Blue Spruce Seedling",
            "image_url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/images/seedling.jpg",
            "subtitle":"Location: NITA, Mombasa\nUSD $2.00",
            "default_action": {
              "type": "web_url",
              "url": "https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/",
                "title":"View Website"
              },{
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
                "title":"Adopt me!"
              }              
            ]      
          }, {
            "title":"Moringa Tree Seedling",
            "image_url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/images/seedling.jpg",
            "subtitle":"Location: Mnazini Majengo, Mombasa\nUSD $4.00",
            "default_action": {
              "type": "web_url",
              "url": "https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/",
                "title":"View Website"
              },{
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
                "title":"Adopt me!"
              }              
            ]      
          }, {
            "title":"Acacia Seedling",
            "image_url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/images/seedling.jpg",
            "subtitle":"Location: White House, Mshomoroni\nUSD $2.00",
            "default_action": {
              "type": "web_url",
              "url": "https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/",
                "title":"View Website"
              },{
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
                "title":"Adopt me!"
              }              
            ]      
          }, {
            "title":"Acacia Seedling",
            "image_url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/images/seedling.jpg",
            "subtitle":"Location: White House, Mshomoroni\nUSD $2.00",
            "default_action": {
              "type": "web_url",
              "url": "https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/",
                "title":"View Website"
              },{
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
                "title":"Adopt me!"
              }              
            ]      
          }, {
            "title":"Fountain Tree Seedling",
            "image_url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/images/seedling.jpg",
            "subtitle":"Location: Mamba Village Nyali, Mombasa\nUSD $5.00",
            "default_action": {
              "type": "web_url",
              "url": "https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
              "webview_height_ratio": "tall",
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/",
                "title":"View Website"
              },{
                "type":"web_url",
                "url":"https://harrison-gitau.github.io/Adopt-a-Seedling/UI/adoptme.html",
                "title":"Adopt me!"
              }              
            ]      
          }
        ]
      }
    }
  };

  // Send the response messages and horizontally scrollable carousel 
  callSendAPI(sender_psid, instruct);
  callSendAPI(sender_psid, mssg);
  callSendAPI(sender_psid, continuePayload);

}

function statusUpdate(sender_psid, status, callbackfn) {

  // Get current conversation stage
  const query = {
    user_id: sender_psid
  };
  const update = {
    status: status
  };
  const options = {
    upsert: status === GET_STARTED_PAYLOAD
  }; // Create new document for new client
  console.log(options, update, query);
  // Save the current chat status to MongoDB
  ChatStatus.findOneAndUpdate(query, update, options).exec(cs => {
    console.log('update status to db: ', cs);
    callbackfn(sender_psid);
  });
}

function messageHandler(sender_psid, received_message) {
  // Check message contents
  console.log('messageHandler message:', JSON.stringify(received_message));

  let response, response2;

  // Checks if the message contains quick_reply property
  if (!received_message.quick_reply) {

    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      "text": `Sorry, but I don't recognise "${received_message.text}".`
    };
    response2 = {
      "text": INSTRUCTIONS
    };

    // Send the response messages
    callSendAPI(sender_psid, response);
    callSendAPI(sender_psid, response2);

  }
  // Checks if the message contains attachments
  else if (received_message.attachments) {
    response = {
      "text": "No attachments please!"
    };
    response2 = {
      "text": INSTRUCTIONS
    };

    // Send the response messages
    callSendAPI(sender_psid, response);
    callSendAPI(sender_psid, response2);
  }
}

function postbackHandler(sender_psid, received_postback) {

  console.log('ok')

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload and update db
  switch (payload) {
    case GET_STARTED_PAYLOAD:
      statusUpdate(sender_psid, payload, greetingPostbackHandler);
      break;

    case START_SEARCH_YES:
      statusUpdate(sender_psid, payload, continuePostbackHandler);
      break;

    default:
      console.log("Unidentified payload type");
      break;
  }
}

function callSendAPI(sender_psid, response) {

  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": `${FACEBOOK_GRAPH_API}me/messages`,
    "qs": {
      "access_token": PAGE_ACCESS_TOKEN
    },
    "method": "POST",
    "json": request_body
  }, (err, body) => {

    if (!err) {

      console.log('message sent:', body.statusMessage)

    } else {

      console.error("Unable to send message:" + err);

    }

  });

}

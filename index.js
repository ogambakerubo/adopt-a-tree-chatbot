/**
 * Messenger Platform Adopt-a-tree
 */

"use strict";
require("dotenv").config();

const GET_STARTED_PAYLOAD = "GET_STARTED_PAYLOAD";
const INSTRUCTIONS =
  "At any time, use the menu provided to navigate through the features.";
const START_SEARCH_NO = "START_SEARCH_NO";
const START_SEARCH_YES = "START_SEARCH_YES";
const CARE_HELP = "CARE_HELP";
const VISIT_WEBSITE = "VISIT_WEBSITE";
const ORDER_INQUIRIES = "ORDER_INQUIRIES";
const BILLING_ISSUES = "BILLING_ISSUES";
const OTHER = "OTHER";
/*const ADOPT_A_TREE = "ADOPT_A_TREE";*/
const MONGODB_URI = process.env.MONGODB_URI;

// Imports dependencies and set up http server
const express = require("express"),
  body_parser = require("body-parser"),
  mongoose = require("mongoose"),
  Promise = require("promise"),
  app = express(); // Creates express http server
app.use(body_parser.json()); // Parses json requests

// Connect to MongoDB
// eslint-disable-next-line no-unused-vars
var db = mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("Database connection successful");
  })
  .catch(err => {
    console.error("Database connection error:", err);
  });

// Local imports
var ChatStatus = require("./models/chatstatus");
var defaultResponse = require("./utils/default");
var handlers = require("./utils/handlers");
var call = require("./utils/call");

// Sets server port and logs message on success
const server = app.listen(process.env.PORT || 5000, () => {
  console.log(
    "Express server listening on port %d in %s mode",
    server.address().port,
    app.settings.env
  );
});

// Accepts POST requests at /webhook endpoint from Messenger platform
app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === "page") {
    // Iterate over each entry
    // There may be multiple if batched
    if (body.entry && body.entry.length <= 0) {
      return;
    }

    body.entry.forEach(entry => {
      // Secondary Receiver is in control - listen on standby channel
      if (entry.standby) {
        // iterate webhook events from standby channel
        entry.standby.forEach(event => {
          console.log("standby event secondary channel:", event);
          if (event.message && event.message.is_echo) {
            const receiver = event.recipient.id;
            const mssg = event.message.text;

            console.log("receiver id:", receiver);
            console.log("Message:", mssg);
          }
        });
      }

      // Primary bot is in control - listen for messages
      if (entry.messaging) {
        // Gets the body of the webhook event
        let webhook_event = entry.messaging;

        // Iterate over each webhook_event and handle accordingly
        webhook_event.forEach(event => {
          // Log event
          console.log("Primary webhook event:", { event });

          // Get the sender PSID
          let sender_psid = event.sender.id;
          console.log("Sender ID: " + sender_psid);

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
        });
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint
app.get("/webhook", (req, res) => {
  // Use environment vars
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

function statusUpdate(sender_psid, status, callback) {
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
    console.log("update status to db: ", cs);
    callback(sender_psid);
  });
}

/*function orderUpdate(sender_psid, callback) {
  console.log(sender_psid);
  callback(sender_psid);
}*/

function messageHandler(sender_psid, received_message) {
  // Check message contents
  console.log("messageHandler message:", JSON.stringify(received_message));

  let response, response2;
  let promises = () => {
    // Send the response messages asynchronously and horizontally scrollable carousel
    let one = () => {
      return new Promise(resolve => {
        setTimeout(() => {
          call("/messages", response, () => {});
          resolve();
        }, 500);
      });
    };

    let two = () => {
      return new Promise(resolve => {
        setTimeout(() => {
          call("/messages", response2, () => {});
          resolve();
        }, 500);
      });
    };

    let three = () => {
      return new Promise(resolve => {
        setTimeout(() => {
          defaultResponse(sender_psid);
          resolve();
        }, 500);
      });
    };

    one()
      .then(() => two())
      .catch(reason =>
        console.log("Handle rejected promise (" + reason + ") here.")
      )
      .then(() => three())
      .catch(reason =>
        console.log("Handle rejected promise (" + reason + ") here.")
      );
  };

  // Checks if the message contains quick_reply property
  if (!received_message.quick_reply && !received_message.attachments) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      recipient: {
        id: sender_psid
      },
      message: {
        text: `Sorry, but I don't recognise "${received_message.text}" 😕.`
      }
    };
    response2 = {
      recipient: {
        id: sender_psid
      },
      message: {
        text: INSTRUCTIONS
      }
    };

    promises();
  }
  // Checks if the message contains attachments
  else if (!received_message.quick_reply && received_message.attachments) {
    response = {
      recipient: {
        id: sender_psid
      },
      message: {
        text: "No attachments please!"
      }
    };
    response2 = {
      recipient: {
        id: sender_psid
      },
      message: {
        text: INSTRUCTIONS
      }
    };

    promises();
  }
}

function postbackHandler(sender_psid, received_postback) {
  console.log("Sorting postback payloads ....");

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload and update db
  switch (payload) {
    case GET_STARTED_PAYLOAD:
      statusUpdate(sender_psid, payload, handlers.greetingPostbackHandler);
      break;

    case START_SEARCH_YES:
      statusUpdate(sender_psid, payload, handlers.continuePostbackHandler);
      break;

    case START_SEARCH_NO:
      statusUpdate(sender_psid, payload, handlers.no_thanksPostbackHandler);
      break;

    case VISIT_WEBSITE:
      statusUpdate(sender_psid, payload, handlers.websitePostbackHandler);
      break;

    case CARE_HELP:
      statusUpdate(sender_psid, payload, handlers.helplinePostbackHandler);
      break;

    case ORDER_INQUIRIES:
    case BILLING_ISSUES:
    case OTHER:
      statusUpdate(sender_psid, payload, handlers.handoverPostbackHandler);
      break;

    /*case ADOPT_A_TREE:
      orderUpdate(sender_psid, handlers.add_to_cartHandler);
      break;*/

    default:
      console.log("Unidentified payload type:", payload);
      break;
  }
}

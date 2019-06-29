/**
 * Payload Handlers
 */
"use strict";
require("dotenv").config();

const PERSONA_ID = process.env.PERSONA_ID;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const INSTRUCTIONS =
  "At any time, use the menu provided to navigate through the features.";
const START_SEARCH_NO = "START_SEARCH_NO";
const START_SEARCH_YES = "START_SEARCH_YES";
const CARE_HELP = "CARE_HELP";
const VISIT_WEBSITE = "VISIT_WEBSITE";
const ORDER_INQUIRIES = "ORDER_INQUIRIES";
const BILLING_ISSUES = "BILLING_ISSUES";
const OTHER = "OTHER";
const FACEBOOK_GRAPH_API = "https://graph.facebook.com/v2.6/";

// Import dependencies
const request = require("request"),
  Promise = require("promise");
// Local imports
const call = require("../utils/call");
const Carousel = require("../store/carousel");
const handover_protocol = require("../customer_care/helpline");

function greetingPostbackHandler(sender_psid) {
  // send request to fb graph api to get client first name
  request(
    {
      url: `${FACEBOOK_GRAPH_API}${sender_psid}`,
      qs: {
        access_token: PAGE_ACCESS_TOKEN,
        fields: "first_name"
      },
      method: "GET"
    },
    (error, msgbody) => {
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
      const mssg =
        greeting +
        "Now you can begin the journey of adopting your very own tree 🎉";
      // Create quick reply options
      const greetingPayload = {
        recipient: {
          id: sender_psid
        },
        message: {
          text: mssg,
          quick_replies: [
            {
              content_type: "text",
              title: "Continue",
              payload: START_SEARCH_YES
            },
            {
              content_type: "text",
              title: "No, thanks.",
              payload: START_SEARCH_NO
            }
          ]
        }
      };
      // Send the response message to acknowledge the payload
      call("/messages", greetingPayload, () => {});
    }
  );
}

function continuePostbackHandler(sender_psid) {
  // This handles the START_SEARCH_YES payload
  // Create carousel of generic templates and response messages
  const mssg = {
    recipient: {
      id: sender_psid
    },
    message: {
      text: "We have some great options for you"
    }
  };
  const instruct = {
    recipient: {
      id: sender_psid
    },
    message: {
      text: INSTRUCTIONS
    }
  };
  const carouselResponse = {
    recipient: {
      id: sender_psid
    },
    message: Carousel
  };
  console.log("continue: CONTINUEPOSTBACKHANDLER");

  // Send the response messages asynchronously and horizontally scrollable carousel
  let one = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        call("/messages", instruct, () => {});
        resolve();
      }, 500);
    });
  };

  let two = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        call("/messages", mssg, () => {});
        resolve();
      }, 500);
    });
  };

  let three = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        call("/messages", carouselResponse, () => {});
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
}

function no_thanksPostbackHandler(sender_psid) {
  // Handle the START_SEARCH_NO postback
  console.log("NO THANKS");
  const message =
    "That's OK. You can still visit our website to make a one time donation or talk to an agent to learn more";
  // Create quickreply options
  const no_thanks = {
    recipient: {
      id: sender_psid
    },
    message: {
      text: message,
      quick_replies: [
        {
          content_type: "text",
          title: "Visit Website",
          payload: VISIT_WEBSITE
        },
        {
          content_type: "text",
          title: "Talk to agent",
          payload: CARE_HELP
        }
      ]
    }
  };

  // Send the response message
  call("/messages", no_thanks, () => {});
}

function websitePostbackHandler(sender_psid) {
  // Handle the VISIT_WEBSITE postback
  console.log("SEND TO WEBSITE");
  // Create single generic template
  const postcard = {
    recipient: {
      id: sender_psid
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Visit Website",
              image_url:
                "https://harrison-gitau.github.io/Adopt-a-Seedling/UI/images/tree.png",
              subtitle: "Make a donation for as little as USD $0.50",
              default_action: {
                type: "web_url",
                url: "https://harrison-gitau.github.io/Adopt-a-Seedling/UI/",
                webview_height_ratio: "tall"
              },
              buttons: [
                {
                  type: "web_url",
                  url: "https://harrison-gitau.github.io/Adopt-a-Seedling/UI/",
                  title: "View Website"
                }
              ]
            }
          ]
        }
      }
    }
  };

  // Sender the response message
  call("/messages", postcard, () => {});
}

function helplinePostbackHandler(sender_psid) {
  // Handle the CARE_HELP postback
  console.log("HELP CENTRE...");
  // Hand over to live agent specs
  let mssg =
    "Can you please tell me what this is about so I can redirect you to the right team?";
  // Message with quick reply options
  const care_help = {
    recipient: {
      id: sender_psid
    },
    message: {
      text: mssg,
      quick_replies: [
        {
          content_type: "text",
          title: "Order Inquiries",
          payload: ORDER_INQUIRIES
        },
        {
          content_type: "text",
          title: "Billing Issues",
          payload: BILLING_ISSUES
        },
        {
          content_type: "text",
          title: "Other",
          payload: OTHER
        }
      ]
    }
  };

  // Send response message to graph api
  call("/messages", care_help, () => {});
}

function handoverPostbackHandler(sender_psid) {
  // Pass conversation to secondary channel
  console.log("Passing Thread to Live Agent...");
  // Page Inbox target id
  const targetAppId = 263902037430900;

  const msg = {
    text: "Hello, I'm Vivian from Adopt-a-Tree. How may I help you?"
  };
  const personaId = PERSONA_ID;
  const response = {
    recipient: {
      id: sender_psid
    },
    message: msg,
    persona_id: personaId
  };
  call("/messages", response, () => {});

  handover_protocol.passThreadControl(sender_psid, targetAppId);
}

function add_to_cartHandler() {
  
}

module.exports = {
  greetingPostbackHandler,
  continuePostbackHandler,
  no_thanksPostbackHandler,
  websitePostbackHandler,
  helplinePostbackHandler,
  handoverPostbackHandler,
  add_to_cartHandler
};

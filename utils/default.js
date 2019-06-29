/**
 * Send default error message and carousel menu
 * @param {any} sender_psid
 */
"use strict";
// Import dependencies
const Promise = require("promise");

// Local imports
const call = require("../utils/call");
const Carousel = require("../store/carousel");

function defaultResponse(sender_psid) {
  console.log("SENDING DEFAULT RESPONSE");
  // This is the default response
  const response = {
    recipient: {
      id: sender_psid
    },
    message: {
      text: "You can browse our options below"
    }
  };

  const carouselResponse = {
    recipient: {
      id: sender_psid
    },
    message: Carousel
  };
  // Send the response messages asynchronously
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
        call("/messages", carouselResponse, () => {});
        resolve();
      }, 500);
    });
  };

  one()
    .then(() => two())
    .catch(reason =>
      console.log("Handle rejected promise (" + reason + ") here.")
    );
}

module.exports = defaultResponse;

/**
 * Call function used to send HTTP requests to
 * Facebook Graph API
 * @param {String} path
 * @param {json} payload
 * @param {function} callback
 */
"use strict";
require("dotenv").config();
const request = require("request");

// Send the http request to graph api
function call(path, payload, callback) {
  const access_token = process.env.PAGE_ACCESS_TOKEN;
  const graph_url = "https://graph.facebook.com/me";
  // Catch missing parameters
  if (!path) {
    console.error("No endpoint specified on Messenger send!");
    return;
  } else if (!access_token || !graph_url) {
    console.error("No Page access token or graph API url configured!");
    return;
  }
  // Make POST request to send message to the consumer
  request(
    {
      uri: graph_url + path,
      qs: {
        access_token: access_token
      },
      method: "POST",
      json: payload
    },
    (error, response) => {
      let request_body = JSON.parse(response.request.body);
      if (!error && response.statusCode === 200) {
        console.log("Message sent succesfully:", request_body.message);
        console.log("That's it!");
      } else {
        console.error("Error: " + error);
      }
      callback(request_body.message);
    }
  );
}

// Export Call function
module.exports = call;

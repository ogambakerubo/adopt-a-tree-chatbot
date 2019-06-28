/**Handover Protocol */

'use strict';
require('dotenv').config();
const request = require('request');

function call (path, payload, callback) {
  const access_token = process.env.PAGE_ACCESS_TOKEN;
  const graph_url = 'https://graph.facebook.com/me';

  if (!path) {
    console.error('No endpoint specified on Messenger send!');
    return;
  } else if (!access_token || !graph_url) {
    console.error('No Page access token or graph API url configured!');
    return;
  }

  request({
    uri: graph_url + path,
    qs: {'access_token': access_token},
    method: 'POST',
    json: payload,
  }, (error, response, body) => {
    console.log(body)
    if (!error && response.statusCode === 200) {
      console.log('Message sent succesfully');
    } else {
      console.error('Error: ' + error);        
    }
    callback(body);
  });
}

function passThreadControl (userPsid, targetAppId, pass_metadata) {
  console.log('PASSING THREAD CONTROL');
  let payload = {
    recipient: {
      id: userPsid
    },
    target_app_id: targetAppId,
    metadata: pass_metadata
  };

  call('/pass_thread_control', payload, () => {});
}

function takeThreadControl (userPsid) {
  console.log('TAKING THREAD CONTROL')
  let payload = {
    recipient: {
      id: userPsid
    }
  };

  call('/take_thread_control', payload, () => {});
}

module.exports = {
  passThreadControl,
  takeThreadControl,
  call
};

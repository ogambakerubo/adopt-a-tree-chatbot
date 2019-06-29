/**Handover Protocol */
"use strict";
var call = require("../utils/call");

// Pass thread control from Primary Bot
function passThreadControl(userPsid, targetAppId) {
  console.log("PASSING THREAD CONTROL");
  let payload = {
    recipient: {
      id: userPsid
    },
    target_app_id: targetAppId
  };

  call("/pass_thread_control", payload, () => {});
}
// Take thread control from Secondary Channel
function takeThreadControl(userPsid) {
  console.log("TAKING THREAD CONTROL");
  let payload = {
    recipient: {
      id: userPsid
    }
  };

  call("/take_thread_control", payload, () => {});
}

module.exports = {
  passThreadControl,
  takeThreadControl
};

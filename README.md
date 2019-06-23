# adopt-a-tree-chatbot
Messenger Chatbot for the Adopt-a-tree website

### Basic Flow Outline
Client sends a message on the messenger app to the chatbot →
Facebook Messenger Platform fires an event →
Webhook is notified with the event →
Our backend code receives the event details and we can send response to the sender by calling a HTTP Post to Messenger Platform.

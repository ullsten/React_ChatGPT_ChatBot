import { useState } from "react";
import "./App.css";
import "./css/custom_style.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

//Different role ChatBot can have
const roleContents = [
  "Explain things like you're talking to a software professional with 20 years of experience.",
  "Provide details as if you're instructing a student in a classroom.",
  "Discuss the topic as if you're presenting to a group of senior engineers.",
  "Answer like you are a cowboy",
  // Add more role content strings as needed
];

//Get Api key from env file
const API_KEY = import.meta.env.VITE_ChatGPT_API_KEY;

function App() {
  const [selectedRoleContent, setSelectedRoleContent] = useState(
    roleContents[0]
  );

  // "Explain things like you would to a 10 year old learning how to code."
  const systemMessage = {
    role: "system",
    content: selectedRoleContent,
  };

  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act.
    const apiRequestBody = {
      model: "gpt-4-1106-preview",
      messages: [
        systemMessage, // The system message DEFINES the logic of our chatGPT
        ...apiMessages, // The messages from our chat with ChatGPT
      ],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        console.log(data.choices[0].message.content);

        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          },
        ]);
        setIsTyping(false);
      });
  }

  return (
    <div className="">
      <div className="m-4">
        <label htmlFor="roleContent">Select Role Content:</label>
        <select
          id="roleContent"
          value={selectedRoleContent}
          onChange={(e) => setSelectedRoleContent(e.target.value)}
        >
          {roleContents.map((content) => (
            <option key={content} value={content}>
              {content}
            </option>
          ))}
        </select>
      </div>
      <hr className="m-7"></hr>
      <div className="custom-chat-container">
        <MainContainer>
          <ChatContainer className="ChatGPT_bubble_style">
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                isTyping ? (
                  <TypingIndicator content="ChatGPT is typing" />
                ) : null
              }
            >
              <div className="message_style">
                {messages.map((message, i) => {
                  console.log(message);
                  return <Message key={i} model={message} />;
                })}
              </div>
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;

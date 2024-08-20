// components/InstructionPage.js

import React from "react";

import "./InstructionPage.css";

function InstructionPage({ onStartChat }) {
  return (
    <div className="instruction-page">
      <h1>Instructions</h1>
      In the following pages you will be shown a set of text message
      conversations.
      <ol>
        <li className="instruction-item">
          You will be given a persona (who you are) and a scenario (what you are
          doing)
        </li>
        <li className="instruction-item">
          You will be asked to respond to the last message in the conversation
        </li>
        <li className="instruction-item">
          Sometimes the most recent message may be nonsensical or out of place.
          While staying in character (of the persona assigned to you), respond
          as naturally as you would in real life.
        </li>
      </ol>
      <h4 style={{ color: "red" }}>
        WARNING: Some messages may contain triggering content related to
        sensitive topics like suicide, violence, hate speech, or other
        disturbing content.{"\n"}
      </h4>
      <button onClick={onStartChat}>Start Chat</button>
    </div>
  );
}

export default InstructionPage;

// components/InstructionPage.js

import React from "react";

import "./InstructionPage.css";

function InstructionPage({ onStartChat }) {
  return (
    <div className="instruction-page">
      <h1>Instructions</h1>

      <ol>
        <li className="instruction-item">
          Carefully read the scenario provided to understand the context and
          your role in the conversation.
        </li>
        <li className="instruction-item">
          Imagine yourself in the given role. For example, if you are asked to
          call your friend's mom about medicine dosage, think about how you
          would naturally approach this conversation.
        </li>

        <li className="instruction-item">
          Your first message will be auto-populated based on the scenario.
          Review it and prepare to respond accordingly.
        </li>

        <li className="instruction-item">
          After sending the first message, you will receive a reply. This reply
          may seem out of place, nonsensical, or unusual. While staying in
          character, respond as naturally as you would in real life.
        </li>

        <li className="instruction-item">
          After completing the interaction, submit your response and move onto
          the next scenario.
        </li>
      </ol>

      <button onClick={onStartChat}>Start Chat</button>
    </div>
  );
}

export default InstructionPage;

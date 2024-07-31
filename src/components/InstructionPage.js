// components/InstructionPage.js
import React from "react";

function InstructionPage({ onStartChat }) {
  return (
    <div className="instruction-page">
      <h1>Instructions</h1>
      <ol>
        <li>
          <strong>Read the Scenario:</strong> Carefully read the scenario
          provided to understand the context and your role in the conversation.
        </li>
        <li>
          <strong>Assume Your Role:</strong> Imagine yourself in the given role.
          For example, if you are asked to call your friend's mom about medicine
          dosage, think about how you would naturally approach this
          conversation.
        </li>
        <li>
          <strong>First Message:</strong> Your first message will be
          auto-populated based on the scenario. Review it and prepare to respond
          accordingly.
        </li>
        <li>
          <strong>Respond to the Reply:</strong> After sending the first
          message, you will receive a reply. This reply may seem out of place,
          nonsensical, or unusual.
        </li>
        <li>
          <strong>Stay in Character and Respond Naturally:</strong> While
          staying in character, respond as naturally as you would in real life.
        </li>
        <li>
          <strong>Submit Your Responses:</strong> After completing the
          interaction, review your responses to ensure they are consistent with
          the scenario and then submit them.
        </li>
      </ol>
      <button onClick={onStartChat}>Start Chat</button>
    </div>
  );
}

export default InstructionPage;

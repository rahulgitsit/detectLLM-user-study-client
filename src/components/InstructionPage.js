// components/InstructionPage.js
import React from "react";

function InstructionPage({ onStartChat }) {
  return (
    <div className="instruction-page">
      <h1>Instructions</h1>
      <p>General instructions for the user study will be displayed here.</p>
      <button onClick={onStartChat}>Start Chat</button>
    </div>
  );
}

export default InstructionPage;

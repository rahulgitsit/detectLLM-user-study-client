import React, { useState } from "react";
import LoadingPage from "./components/LoadingPage";
import InstructionPage from "./components/InstructionPage";
import ChatInterface from "./components/ChatInterface";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("loading");
  const [userId, setUserId] = useState("");
  // const [userName, setUserName] = useState("");

  const handleUserSubmit = (id) => {
    setUserId(id);
    // setUserName(name);
    setCurrentPage("instruction");
  };

  const handleStartChat = () => {
    setCurrentPage("chat");
  };

  return (
    <div className="App">
      {currentPage === "loading" && (
        <LoadingPage onUserSubmit={handleUserSubmit} />
      )}
      {currentPage === "instruction" && (
        <InstructionPage onStartChat={handleStartChat} />
      )}
      {currentPage === "chat" && <ChatInterface userId={userId} />}
    </div>
  );
}

export default App;

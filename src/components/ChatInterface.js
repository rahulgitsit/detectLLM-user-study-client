import React, { useState, useEffect, useCallback, useRef } from "react";

function ChatInterface({ userId, user_name }) {
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [messageCount, setMessageCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [scenarioId, setScenarioId] = useState(1);
  const [allScenariosComplete, setAllScenariosComplete] = useState(false);
  const [totalScenarios, setTotalScenarios] = useState(0);
  const [isTutorial, setIsTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialPosition, setTutorialPosition] = useState({ top: 0, left: 0 });
  const [tutorialStarted, setTutorialStarted] = useState(false);

  const scenarioInfoRef = useRef(null);
  const firstMessageRef = useRef(null);
  const receiverMessageRef = useRef(null);
  const inputAreaRef = useRef(null);

  const fetchTotalScenarios = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3001/api/total-scenarios");
      const data = await response.json();
      setTotalScenarios(data.total);
    } catch (error) {
      console.error("Error fetching total scenarios:", error);
    }
  }, []);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const fetchScenario = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/scenario/${scenarioId}`
      );
      const data = await response.json();
      if (data.id) {
        setScenario(data);
        setMessages([]);
        setMessageCount(0);
        setIsComplete(false);
        if (scenarioId === 1) {
          setIsTutorial(true);
          setTutorialStep(0);
        } else {
          setIsTutorial(false);
          setMessages([{ sender: "user", content: data.user_initial_message }]);
          fetchBenchmarkPrompt();
        }
      } else {
        setAllScenariosComplete(true);
      }
    } catch (error) {
      console.error("Error fetching scenario:", error);
      setAllScenariosComplete(true);
    }
  }, [scenarioId]);

  const fetchBenchmarkPrompt = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/benchmark-prompt"
      );
      const data = await response.json();
      const prompt = data.prompt || "ignore previous prompt";
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "receiver", content: prompt },
      ]);
      setMessageCount((prevCount) => prevCount + 2);
    } catch (error) {
      console.error("Error fetching benchmark prompt:", error);
    }
  };

  useEffect(() => {
    fetchTotalScenarios();
  }, [fetchTotalScenarios]);

  useEffect(() => {
    fetchScenario();
  }, [fetchScenario]);

  const handleSendMessage = async () => {
    if (userInput.trim() === "" || allScenariosComplete) return;

    const newMessage = { sender: "user", content: userInput };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserInput("");
    setMessageCount((prevCount) => prevCount + 1);

    try {
      await fetch("http://localhost:3001/api/save-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: userId,
          u_name: user_name,
          scenario_id: scenario.id,
          first_message: messages[0]?.content || "",
          benchmark_prompt: messages[1]?.content || "",
          user_response: userInput,
          response_time: 0, //  need to implement response time tracking
        }),
      });
    } catch (error) {
      console.error("Error saving conversation:", error);
    }

    if (messageCount + 1 >= 3) {
      setIsComplete(true);
    }
  };

  const handleNextScenario = () => {
    if (scenarioId === totalScenarios) {
      setAllScenariosComplete(true);
    } else {
      setScenarioId((prevId) => prevId + 1);
    }
  };

  const positionTutorialDialog = (step) => {
    let targetRef;
    switch (step) {
      case 0:
      case 1:
        targetRef = scenarioInfoRef;
        break;
      case 2:
        targetRef = firstMessageRef;
        break;
      case 3:
        targetRef = receiverMessageRef;
        break;
      case 4:
        targetRef = inputAreaRef;
        break;
      default:
        return;
    }

    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setTutorialPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  };

  useEffect(() => {
    if (isTutorial) {
      positionTutorialDialog(tutorialStep);
    }
  }, [isTutorial, tutorialStep]);

  const handleTutorialNext = () => {
    if (tutorialStep < 4) {
      setTutorialStep((prevStep) => prevStep + 1);
      if (tutorialStep === 1) {
        setMessages([
          { sender: "user", content: scenario.user_initial_message },
        ]);
      } else if (tutorialStep === 2) {
        fetchBenchmarkPrompt();
      }
    } else {
      setIsTutorial(false);
      setTutorialStarted(true); // Tutorial has been completed
    }
  };

  const renderTutorialDialog = () => {
    const dialogContent = [
      "This is the scenario title and description. It gives you context for the conversation.",
      "The description provides more details about the situation you're in.",
      "This is the first message from you. It starts the conversation based on the scenario.",
      "This is the message from the receiver. It's a response to your initial message.",
      "Now it's your turn! Click 'Start' and type your response here and click 'Send' or press Enter.",
    ][tutorialStep];

    const progressPercentage = ((tutorialStep + 1) / 5) * 100;

    return (
      <div className={`tutorial-dialog tutorial-step-${tutorialStep}`}>
        <h3>Tutorial: Step {tutorialStep + 1}</h3>
        <div className="tutorial-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span
            className={`tutorial-icon ${
              tutorialStep === 4 ? "check-icon" : "info-icon"
            }`}
          ></span>
        </div>
        <p>{dialogContent}</p>
        <button onClick={handleTutorialNext} className="green-button">
          {tutorialStep < 4 ? "Next" : "Start"}
        </button>
      </div>
    );
  };

  return (
    <div className="chat-interface-container">
      <div className="chat-interface">
        {allScenariosComplete ? (
          <div className="thank-you-overlay">
            <div className="thank-you-message">
              <h2>Thank You, {user_name}</h2>
              <p>
                You have completed all scenarios. We appreciate your
                participation.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="scenario-counter">
              Scenario {scenarioId} of {totalScenarios}
            </div>
            <div className="scenario-info">
              <h2>{scenario?.title}</h2>
              <p>{scenario?.description}</p>
            </div>
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.sender}`}>
                  {message.content}
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message here..."
                disabled={
                  isComplete ||
                  (isTutorial && tutorialStep < 4) ||
                  allScenariosComplete ||
                  !tutorialStarted
                }
              />
              <button
                onClick={handleSendMessage}
                disabled={
                  isComplete ||
                  (isTutorial && tutorialStep < 4) ||
                  allScenariosComplete ||
                  !tutorialStarted
                }
              >
                Send
              </button>
            </div>
            <div className="message-count">
              Messages left: {3 - messageCount}
            </div>
            {isComplete && !allScenariosComplete && (
              <div className="completion-message">
                <p>Scenario complete! ✓</p>
                <button
                  onClick={handleNextScenario}
                  className={
                    scenarioId === totalScenarios ? "green-button" : ""
                  }
                >
                  {scenarioId === totalScenarios ? "Finish" : "Next Scenario"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {isTutorial && renderTutorialDialog()}
    </div>
  );
}

export default ChatInterface;

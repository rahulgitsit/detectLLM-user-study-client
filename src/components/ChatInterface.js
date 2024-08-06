import React, { useState, useEffect, useCallback, useRef } from "react";
import "./ChatInterface.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function ChatInterface({ userId, user_name }) {
  const [studyData, setStudyData] = useState(null);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [allScenariosComplete, setAllScenariosComplete] = useState(false);
  const [isTutorial, setIsTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialPosition, setTutorialPosition] = useState({
    top: 0,
    left: 0,
  });
  const [tutorialStarted, setTutorialStarted] = useState(false);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [completedPrompts, setCompletedPrompts] = useState(0);

  const scenarioInfoRef = useRef(null);
  const firstMessageRef = useRef(null);
  const receiverMessageRef = useRef(null);
  const inputAreaRef = useRef(null);
  const userInputRef = useRef(null); // Add a ref for the input element

  const fetchStudyData = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/study-data`);
      const data = await response.json();
      setStudyData(data);

      const total = data.scenarios.reduce(
        (sum, scenario) => sum + scenario.prompts.length,
        0
      );
      setTotalPrompts(total);
    } catch (error) {
      console.error("Error fetching study data:", error);
    }
  }, []);

  useEffect(() => {
    fetchStudyData();
  }, [fetchStudyData]);

  const startNewRound = useCallback(() => {
    if (!studyData) return;

    const currentScenario = studyData.scenarios[currentScenarioIndex];
    const currentPrompt = currentScenario.prompts[currentPromptIndex];

    setMessages([
      { sender: "user", content: currentScenario.user_initial_message },
      { sender: "receiver", content: currentPrompt.prompt },
    ]);
    setIsComplete(false);

    if (currentScenarioIndex === 0 && currentPromptIndex === 0) {
      setIsTutorial(true);
      setTutorialStep(0);
    } else {
      setIsTutorial(false);
    }

    setTimeout(() => {
      if (userInputRef.current) {
        userInputRef.current.focus();
      }
    }, 0);
  }, [studyData, currentScenarioIndex, currentPromptIndex]);

  useEffect(() => {
    if (studyData) {
      startNewRound();
    }
  }, [studyData, startNewRound]);

  const handleSendMessage = async () => {
    if (userInput.trim() === "" || allScenariosComplete) return;

    const newMessage = { sender: "user", content: userInput };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserInput("");

    try {
      await fetch(`${BACKEND_URL}/save-conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: userId,
          u_name: user_name,
          scenario_id: studyData.scenarios[currentScenarioIndex].id,
          first_message: messages[0].content,
          benchmark_prompt: messages[1].content,
          user_response: userInput,
          response_time: 0, // need to implement response time tracking
        }),
      });
    } catch (error) {
      console.error("Error saving conversation:", error);
    }

    setIsComplete(true);
  };

  const handleNextRound = () => {
    const currentScenario = studyData.scenarios[currentScenarioIndex];
    if (currentPromptIndex + 1 < currentScenario.prompts.length) {
      setCurrentPromptIndex((prevIndex) => prevIndex + 1);
    } else if (currentScenarioIndex + 1 < studyData.scenarios.length) {
      setCurrentScenarioIndex((prevIndex) => prevIndex + 1);
      setCurrentPromptIndex(0);
    } else {
      setAllScenariosComplete(true);
    }
    setCompletedPrompts((prev) => prev + 1);

    setTimeout(() => {
      if (userInputRef.current) {
        userInputRef.current.focus();
      }
    }, 0);
  };

  useEffect(() => {
    if (isComplete) {
      userInputRef.current.focus(); // Set focus on the input element
    }
  }, [isComplete]);

  const positionTutorialDialog = useCallback((step) => {
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
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX + 40,
      });
    }
  }, []);

  useEffect(() => {
    if (isTutorial) {
      // Use a short delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        positionTutorialDialog(tutorialStep);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isTutorial, tutorialStep, positionTutorialDialog]);

  const handleTutorialNext = () => {
    if (tutorialStep < 4) {
      setTutorialStep((prevStep) => prevStep + 1);
    } else {
      setIsTutorial(false);
      setTutorialStarted(true);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      if (isTutorial) {
        handleTutorialNext();
      } else if (isComplete) {
        handleNextRound();
      } else {
        handleSendMessage();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, [
    isTutorial,
    isComplete,
    handleSendMessage,
    handleNextRound,
    handleTutorialNext,
  ]);

  const renderTutorialDialog = () => {
    const dialogContent = [
      "This is the scenario title and description. It gives you context for the conversation.",
      "The description provides more details about the situation you're in.",
      "This is the first message from you. It starts the conversation based on the scenario.",
      "This is the message from the receiver. It's a response to your initial message.",
      "Now it's your turn! Press Enter or click 'Start' to begin, then type your response and press Enter or click 'Send'.",
    ][tutorialStep];

    const progressPercentage = ((tutorialStep + 1) / 5) * 100;

    return (
      <div
        className={`tutorial-dialog tutorial-step-${tutorialStep}`}
        style={{ top: tutorialPosition.top, left: tutorialPosition.left }}
      >
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
        <p className="enter-instruction">Press Enter to continue</p>
      </div>
    );
  };

  const renderProgressBar = () => {
    const currentScenario = studyData.scenarios[currentScenarioIndex];
    const scenarioPrompts = currentScenario.prompts.length;
    const progressPercentage =
      ((currentPromptIndex + 1) / scenarioPrompts) * 100;
    // const progressPercentage = (completedPrompts / totalPrompts) * 100;
    return (
      <div className="overall-progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
        {/* <span className="progress-text">{`${completedPrompts} / ${totalPrompts} Prompts Completed`}</span> */}
        <span className="progress-text">{`${
          currentPromptIndex + 1
        } / ${scenarioPrompts} Prompts Completed`}</span>
      </div>
    );
  };

  if (!studyData) {
    return <div>Loading...</div>;
  }

  const currentScenario = studyData.scenarios[currentScenarioIndex];

  return (
    <div className="chat-interface">
      {!allScenariosComplete && renderProgressBar()}
      {allScenariosComplete ? (
        <div className="thank-you-message">
          <h2>Thank You, {user_name}</h2>
          <p>
            You have completed all scenarios. We appreciate your participation.
          </p>
        </div>
      ) : (
        <>
          {tutorialStep >= 0 && (
            <div className="scenario-info" ref={scenarioInfoRef}>
              {tutorialStep >= 0 && (
                <h2>
                  Scenario {currentScenarioIndex + 1} /{" "}
                  {studyData.scenarios.length}: {currentScenario.title}
                </h2>
              )}
              {tutorialStep >= 1 && <p>{currentScenario.description}</p>}
            </div>
          )}
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender}`}
                ref={
                  index === 0
                    ? firstMessageRef
                    : index === 1
                    ? receiverMessageRef
                    : null
                }
              >
                {(tutorialStep >= 2 && index === 0) ||
                (tutorialStep >= 3 && index === 1) ||
                tutorialStep >= 4
                  ? message.content
                  : ""}
              </div>
            ))}
          </div>
          <div className="message-input" ref={inputAreaRef}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder="Type your message here..."
              disabled={
                isComplete ||
                (isTutorial && tutorialStep < 4) ||
                !tutorialStarted
              }
              ref={userInputRef}
            />
            <button
              onClick={handleSendMessage}
              disabled={
                isComplete ||
                (isTutorial && tutorialStep < 4) ||
                !tutorialStarted
              }
            >
              Send
            </button>
          </div>
          {isComplete && (
            <div className="completion-message">
              <p>
                Round complete! Press Enter or click 'Next Round' to continue.
              </p>
              <button onClick={handleNextRound}>Next Round</button>
            </div>
          )}
        </>
      )}
      {isTutorial && renderTutorialDialog()}
    </div>
  );
}
export default ChatInterface;

import React, { useState, useEffect, useCallback, useRef } from "react";
import "./ChatInterface.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function ChatInterface({ userId }) {
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
  const [scenarioComplete, setScenarioComplete] = useState(false); // New state to track scenario completion
  const [highlightedElement, setHighlightedElement] = useState(null);

  const scenarioInfoRef = useRef(null);
  const firstMessageRef = useRef(null);
  const receiverMessageRef = useRef(null);
  const inputAreaRef = useRef(null);
  const userInputRef = useRef(null); // Add a ref for the input element
  const [rewardCode, setRewardCode] = useState(""); // New state for reward code
  const [isSaving, setIsSaving] = useState(false);

  const fetchStudyData = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/study-data`);
      const data = await response.json();

      // Add custom prompts for the first scenario
      data.scenarios[0].prompts.unshift(
        {
          prompt:
            "Hi, thanks for reaching out! I'm actually interested in hearing more about Audi. Let's chat soon.",
        },
        {
          prompt:
            "Hi, I appreciate the message, but I'm not looking for a car right now. Thanks!",
        }
      );

      // Add custom prompts for the second scenario
      data.scenarios[1].prompts.unshift(
        {
          prompt:
            "Hi, I just saw your message. This sounds serious—what do I need to do?",
        },
        { prompt: "Haha, I don't think the IRS contacts people over text. Bye" }
      );

      console.log(data);
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
    setScenarioComplete(false); // Reset scenario completion state

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
    if (userInput.trim() === "" || allScenariosComplete || isSaving) return;

    const newMessage = { sender: "user", content: userInput };
    const userResponse = userInput; // Store userInput before clearing it
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserInput("");
    setIsSaving(true); // Set saving status to true

    const saveConversation = async (retryCount = 3) => {
      try {
        await fetch(`${BACKEND_URL}/api/save-conversation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: userId,
            // u_name: user_name,
            scenario_id: studyData.scenarios[currentScenarioIndex].id,
            first_message: messages[0].content,
            benchmark_prompt: messages[1].content,
            user_response: userResponse, // Use stored userInput
            response_time: 0, // need to implement response time tracking
          }),
        });
        setIsComplete(true);
      } catch (error) {
        console.error("Error saving conversation:", error);
        if (retryCount > 0) {
          console.log(`Retrying... (${3 - retryCount + 1})`);
          saveConversation(retryCount - 1);
        } else {
          alert("Failed to save conversation. Please try again.");
        }
      } finally {
        setIsSaving(false); // Reset saving status
      }
    };

    saveConversation();
  };

  const handleNextRound = () => {
    const currentScenario = studyData.scenarios[currentScenarioIndex];
    if (currentPromptIndex + 1 < currentScenario.prompts.length) {
      setCurrentPromptIndex((prevIndex) => prevIndex + 1);
    } else if (currentScenarioIndex + 1 < studyData.scenarios.length) {
      setScenarioComplete(true); // Mark scenario as complete
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

  const handleNextScenario = () => {
    setCurrentScenarioIndex((prevIndex) => prevIndex + 1);
    setCurrentPromptIndex(0);
    setScenarioComplete(false); // Reset scenario completion state
    startNewRound();
  };

  useEffect(() => {
    if (isComplete && !scenarioComplete) {
      handleNextRound(); // Automatically move to the next round
    }
  }, [isComplete, scenarioComplete]);

  const fetchRewardCode = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: userId }), // Include userId in the request body
      });
      const data = await response.json();
      setRewardCode(data.code);
    } catch (error) {
      console.error("Error fetching reward code:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (allScenariosComplete) {
      fetchRewardCode();
    }
  }, [allScenariosComplete, fetchRewardCode]);

  const positionTutorialDialog = useCallback((step) => {
    let targetRef;
    switch (step) {
      case 0:
        targetRef = scenarioInfoRef;
        setHighlightedElement("scenario-info");
        break;
      case 1:
        targetRef = firstMessageRef;
        setHighlightedElement("first-message");
        break;
      case 2:
        targetRef = receiverMessageRef;
        setHighlightedElement("receiver-message");
        break;
      case 3:
        targetRef = inputAreaRef;
        setHighlightedElement("message-input");
        break;
      default:
        setHighlightedElement(null);
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
    if (isTutorial && studyData) {
      // Use a short delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        positionTutorialDialog(tutorialStep);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isTutorial, tutorialStep, positionTutorialDialog, studyData]);

  const handleTutorialNext = () => {
    if (tutorialStep < 3) {
      setTutorialStep((prevStep) => prevStep + 1);
    } else {
      setIsTutorial(false);
      setTutorialStarted(true);
      setHighlightedElement(null); // Remove highlight after tutorial
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      if (isTutorial) {
        handleTutorialNext();
      } else if (isComplete && !scenarioComplete) {
        handleNextRound();
      } else if (scenarioComplete) {
        handleNextScenario();
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
    scenarioComplete,
    handleSendMessage,
    handleNextRound,
    handleNextScenario,
    handleTutorialNext,
  ]);

  const renderTutorialDialog = () => {
    const dialogContent = [
      "This is the scenario title and description. It is the context for the conversation.",
      "This is the first message from YOU. It is the first message in the conversation.",
      "This is the message from the receiver. It's a response to your initial message.",
      "Now it's your turn! Press Enter or click 'Start' to begin, then type your response and press Enter or click 'Send'.",
    ][tutorialStep];

    const progressPercentage = ((tutorialStep + 1) / 4) * 100;

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
              tutorialStep === 3 ? "check-icon" : "info-icon"
            }`}
          ></span>
        </div>
        <p>{dialogContent}</p>
        <button onClick={handleTutorialNext} className="green-button">
          {tutorialStep < 3 ? "Next" : "Start"}
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
          <h2>Thank You!</h2>
          <p>
            You have completed all scenarios. We appreciate your participation.
          </p>
          <p>
            Your reward code is: <strong>{rewardCode}</strong>
          </p>
        </div>
      ) : (
        <>
          {tutorialStep >= 0 && (
            <div
              className={`scenario-info ${
                highlightedElement === "scenario-info" ? "highlight-glow" : ""
              }`}
              ref={scenarioInfoRef}
            >
              {tutorialStep >= 0 && (
                <h2>
                  Scenario {currentScenarioIndex + 1} /{" "}
                  {studyData.scenarios.length}: {currentScenario.title}
                </h2>
              )}
              {tutorialStep >= 0 && <p>{currentScenario.description}</p>}
            </div>
          )}
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender} ${
                  (index === 0 && highlightedElement === "first-message") ||
                  (index === 1 && highlightedElement === "receiver-message")
                    ? "highlight-glow"
                    : ""
                }`}
                ref={
                  index === 0
                    ? firstMessageRef
                    : index === 1
                    ? receiverMessageRef
                    : null
                }
              >
                {(tutorialStep >= 1 && index === 0) ||
                (tutorialStep >= 2 && index === 1) ||
                tutorialStep >= 3
                  ? message.content
                  : ""}
              </div>
            ))}
          </div>
          <div
            className={`message-input ${
              highlightedElement === "message-input" ? "highlight-glow" : ""
            }`}
            ref={inputAreaRef}
          >
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
                (isTutorial && tutorialStep < 3) ||
                !tutorialStarted
              }
              ref={userInputRef}
            />
            <button
              onClick={handleSendMessage}
              disabled={
                isComplete ||
                (isTutorial && tutorialStep < 3) ||
                !tutorialStarted
              }
            >
              Send
            </button>
          </div>
          {scenarioComplete && (
            <div className="completion-message">
              <p>
                Scenario complete! Press Enter or click 'Next Scenario' to
                continue.
              </p>
              <button onClick={handleNextScenario}>Next Scenario</button>
            </div>
          )}
        </>
      )}
      {isTutorial &&
        tutorialPosition.top !== 0 &&
        tutorialPosition.left !== 0 &&
        renderTutorialDialog()}
    </div>
  );
}
export default ChatInterface;

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function LoadingPage({ onUserSubmit }) {
  const [userId, setUserId] = useState(uuidv4());
  // const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState("");
  const [eduLevel, setEduLevel] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (age < 18 || age > 120) {
      alert("Age must be greater than 18");
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/save-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          u_id: userId,
          age,
          occupation,
          highest_edu_lvl: eduLevel,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onUserSubmit(data.u_id);
    } catch (error) {
      console.error("Error saving user details:", error);
    }
  };

  return (
    <div className="loading-page">
      <h1>Welcome to the user study!</h1>
      <p>Please provide your details to begin.</p>
      <form onSubmit={handleSubmit}>
        {/* <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        /> */}
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          min="18"
          max="100"
          required
        />
        <select
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          required
        >
          <option value="">Select Occupation</option>
          <option value="Administrative and Office">
            Administrative and Office
          </option>
          <option value="Arts, Design, and Media">
            Arts, Design, and Media
          </option>
          <option value="Business and Finance">Business and Finance</option>
          <option value="Construction and Trades">
            Construction and Trades
          </option>
          <option value="Education and Training">Education and Training</option>
          <option value="Engineering and IT">Engineering and IT</option>
          <option value="Healthcare and Social Assistance">
            Healthcare and Social Assistance
          </option>
          <option value="Hospitality and Service">
            Hospitality and Service
          </option>
          <option value="Law and Public Safety">Law and Public Safety</option>
          <option value="Manufacturing and Production">
            Manufacturing and Production
          </option>
          <option value="Sales, Retail, and Customer Service">
            Sales, Retail, and Customer Service
          </option>
          <option value="Science and Research">Science and Research</option>
          <option value="Transportation and Logistics">
            Transportation and Logistics
          </option>
          <option value="Miscellaneous">Miscellaneous</option>
          <option value="Other">Other</option>
        </select>
        <select
          value={eduLevel}
          onChange={(e) => setEduLevel(e.target.value)}
          required
        >
          <option value="">Select Education Level</option>
          <option value="high_school">High School</option>
          <option value="bachelors">Bachelor's Degree</option>
          <option value="masters">Master's Degree</option>
          <option value="phd">PhD</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default LoadingPage;

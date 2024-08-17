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
      const response = await fetch(`${BACKEND_URL}/save-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          u_id: userId,
          // u_name: name,
          age,
          occupation,
          highest_edu_lvl: eduLevel,
        }),
      });
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
        <input
          type="text"
          placeholder="Occupation"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          required
        />
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

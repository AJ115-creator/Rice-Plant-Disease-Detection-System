import React, { useState } from "react";
import axios from "axios";
import { auth, db } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";
import Login from "./login";
import backgroundImage from "./t.jpg";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [image, setImage] = useState(null);
  const [tabularData, setTabularData] = useState({
    Maximum_Temperature: "",
    Minimum_Temperature: "",
    Temperature: "",
    Precipitation: "",
    Soil_pH: "",
    Relative_Humidity: "",
  });
  const [pastPredictions, setPastPredictions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setImage(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleInputChange = (e) => {
    setTabularData({ ...tabularData, [e.target.name]: e.target.value });
  };

  const submitImage = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please upload an image.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axios.post(
        "http://localhost:8000/predict-image/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessage(response.data.message);

      // Save prediction to Firestore
      await addDoc(collection(db, "predictions"), {
        type: "Image",
        result: response.data.message,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(error);
      setMessage("Error processing the image.");
    } finally {
      setLoading(false);
    }
  };

  const submitTabularData = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/predict-tabular/",
        tabularData
      );
      setMessage(response.data.message);

      // Save prediction to Firestore
      await addDoc(collection(db, "predictions"), {
        type: "Tabular",
        result: response.data.message,
        data: tabularData,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(error);
      setMessage("Error processing tabular data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPastPredictions = async () => {
    const querySnapshot = await getDocs(collection(db, "predictions"));
    const predictions = querySnapshot.docs.map((doc) => doc.data());
    setPastPredictions(predictions);
  };

  const handleLogout = () => {
    signOut(auth);
    setIsLoggedIn(false);
  };

  return isLoggedIn ? (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center py-10"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-500 transition duration-500 shadow-lg
rounded"
      >
        Logout
      </button>
      <h1 className="text-4xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] font-bold text-white mb-10">
        Rice Disease Detection
      </h1>
      {loading && <p className="text-lg text-yellow-200 mb-4">Loading...</p>}
      {message && (
        <h3 className="text-xl font-semibold text-white bg-black bg-opacity-50 px-6 py-2 rounded-md shadow-md mb-6">
          {message}
        </h3>
      )}

      {/* Image Submission Form */}
      <form
        onSubmit={submitImage}
        className="bg-white bg-opacity-20 p-6 rounded-lg shadow-lg w-full max-w-md mb-8"
      >
        <h2 className="text-2xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] font-bold text-center mb-4">
          Submit Image
        </h2>
        <div className="max-w-lg mx-auto">
          <input
            type="file"
            id="image-input"
            className="hidden"
            onChange={handleImageChange}
          />
          <div className="flex items-center space-x-4">
            <label
              htmlFor="image-input"
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-2 px-4 rounded-lg cursor-pointer hover:from-teal-500 hover:to-green-500 transition duration-500 shadow-lg"
            >
              Choose File
            </label>
            <span className="text-sm text-black-700">{fileName}</span>
          </div>
          <div className="mt-1 text-sm text-black font-bold">
            Upload a clear image of the rice plant for disease detection.
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-2 rounded-lg hover:from-teal-500 hover:to-green-500 transition duration-500 shadow-lg mt-4"
        >
          Submit Image
        </button>
      </form>

      {/* Tabular Data Submission Form */}
      <form
        onSubmit={submitTabularData}
        className="bg-white bg-opacity-20 p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-4 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
          Submit Environmental Data
        </h2>

        {[
          { label: "Max Temperature", name: "Maximum_Temperature" },
          { label: "Min Temperature", name: "Minimum_Temperature" },
          { label: "Temperature", name: "Temperature" },
          { label: "Precipitation", name: "Precipitation" },
          { label: "Soil pH", name: "Soil_pH" },
          { label: "Humidity", name: "Relative_Humidity" },
        ].map((field) => (
          <div key={field.name} className="mb-4">
            <label className="block text-black font-bold mb-2">
              {field.label}:
            </label>
            <input
              type="text"
              name={field.name}
              value={tabularData[field.name]}
              onChange={handleInputChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-2 rounded-lg hover:from-teal-500 hover:to-green-500 transition duration-500 shadow-lg"
        >
          Submit Environmental Data
        </button>
      </form>

      <button
        onClick={fetchPastPredictions}
        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-500 transition duration-500 shadow-lg
 font-bold px-4 py-2 rounded mt-6"
      >
        Check Past Predictions
      </button>

      <ul className="mt-4">
        {pastPredictions.map((pred, index) => (
          <li key={index} className="text-white mb-2">
            {pred.type}: {pred.result}
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <Login onLoginSuccess={() => setIsLoggedIn(true)} />
  );
}

export default App;

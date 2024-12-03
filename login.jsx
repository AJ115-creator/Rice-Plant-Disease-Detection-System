import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import backgroundImage from "./loginbg.jpg"; // Adjust path if needed

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state for confirm password
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login and register

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (err) {
      setError("Google login failed. Please try again.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      setError("Registration failed. " + err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (err) {
      setError("Google sign-up failed. Please try again.");
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <form
        onSubmit={isRegistering ? handleRegister : handleLogin}
        className="bg-white bg-opacity-30 p-6 rounded-lg shadow-md w-full md:w-1/3 lg:w-1/3 h-auto"
      >
        <h2 className="text-4xl font-bold mb-4 text-center">
          {isRegistering ? "Create Account" : "Login"}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4"
        />
        {isRegistering && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4"
          />
        )}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-2 px-4 rounded-lg cursor-pointer hover:from-teal-500 hover:to-green-500 transition duration-500 shadow-lg rounded-lg mb-4"
        >
          {isRegistering ? "Register" : "Login"}
        </button>
        {!isRegistering && (
          <>
            <div className="text-center text-black-500 font-bold mb-4">or</div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-2 px-4 rounded-lg cursor-pointer hover:from-teal-500 hover:to-green-500 transition duration-500 shadow-lg p-2 rounded-lg"
            >
              Sign in with Google
            </button>
          </>
        )}
        {isRegistering && (
          <>
            <div className="text-center text-black-500 font-bold mb-4">or</div>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-500 transition duration-500 shadow-lg p-2 rounded-lg"
            >
              Sign up with Google
            </button>
          </>
        )}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-500 underline"
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Don't have an account? Create one"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;


import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "./firebase";
import Login from "./login";
import Register from "./register";
import Dashboard from "./dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("login");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setPage("login");
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <h2>TaskFlow</h2>
        <p>Loading your workspace...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="app-container">
        <Dashboard />
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {page === "login" ? (
        <>
          <Login />
          <p>
            Don't have an account?{" "}
            <button
              className="auth-switch"
              onClick={() => setPage("register")}
            >
              Register
            </button>
          </p>
        </>
      ) : (
        <>
          <Register />
          <p>
            Already have an account?{" "}
            <button
              className="auth-switch"
              onClick={() => setPage("login")}
            >
              Login
            </button>
          </p>
        </>
      )}
    </div>
  );
}

export default App;

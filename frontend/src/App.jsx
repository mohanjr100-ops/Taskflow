
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

  if (loading) {
    return <h2>Loading TaskFlow...</h2>;
  }

  if (user) {
    return (
      <div>
        <Dashboard />
        <button onClick={() => signOut(auth)}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div>
      {page === "login" ? (
        <div>
          <Login />

          <p>Don't have an account?</p>

          <button onClick={() => setPage("register")}>
            Register
          </button>
        </div>
      ) : (
        <div>
          <Register />

          <p>Already have an account?</p>

          <button onClick={() => setPage("login")}>
            Login
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

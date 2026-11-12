
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

import { auth, db } from "./firebase";
import "./App.css";

function Dashboard() {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Listen for the logged-in user's tasks
  useEffect(() => {
    const user = auth.currentUser;

    if (!user) return;

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTasks(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
          }))
        );
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Add a new task
  const addTask = async (e) => {
    e.preventDefault();

    if (!task.trim()) {
      setError("Please enter a task title.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setError("Please log in again.");
      return;
    }

    try {
      setError("");

      await addDoc(collection(db, "tasks"), {
        title: task.trim(),
        priority,
        dueDate,
        completed: false,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      setTask("");
      setPriority("Medium");
      setDueDate("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit a task
  const editTask = async (item) => {
    const updatedTitle = window.prompt(
      "Edit task title:",
      item.title
    );

    if (!updatedTitle || !updatedTitle.trim()) return;

    try {
      await updateDoc(doc(db, "tasks", item.id), {
        title: updatedTitle.trim()
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Complete or reopen a task
  const toggleComplete = async (item) => {
    try {
      await updateDoc(doc(db, "tasks", item.id), {
        completed: !item.completed
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (item) => item.completed
  ).length;
  const pendingTasks = totalTasks - completedTasks;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  // Search and filter
  const filteredTasks = tasks.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Completed" && item.completed) ||
      (filter === "Pending" && !item.completed);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>TaskFlow Dashboard</h1>
          <p>Manage your tasks efficiently</p>
        </div>
      </header>

      {/* Statistics */}
      <section className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <span>{totalTasks}</span>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <span>{completedTasks}</span>
        </div>

        <div className="stat-card">
          <h3>Pending</h3>
          <span>{pendingTasks}</span>
        </div>

        <div className="stat-card">
          <h3>Progress</h3>
          <span>{progress}%</span>
        </div>
      </section>

      {/* Progress bar */}
      <section className="progress-section">
        <div className="progress-heading">
          <h3>Overall Progress</h3>
          <span>{progress}%</span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </section>

      {/* Add task */}
      <section className="add-task-section">
        <h2>Add New Task</h2>

        <form className="task-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="Enter task title"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <button type="submit" className="add-button">
            + Add Task
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </section>

      {/* Task list */}
      <section className="tasks-section">
        <div className="tasks-heading">
          <h2>My Tasks</h2>

          <input
            type="text"
            className="search-input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          {["All", "Pending", "Completed"].map((item) => (
            <button
              key={item}
              className={filter === item ? "active-filter" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="empty-message">Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p className="empty-message">No tasks found.</p>
        ) : (
          <div className="task-list">
            {filteredTasks.map((item) => (
              <div className="task-card" key={item.id}>
                <div className="task-info">
                  <h3
                    className={
                      item.completed ? "completed-title" : ""
                    }
                  >
                    {item.title}
                  </h3>

                  <div className="task-details">
                    <span className={`priority ${item.priority?.toLowerCase() || "medium"}`}>
                      {item.priority || "Medium"} Priority
                    </span>

                    <span>
                      Due Date: {item.dueDate || "Not set"}
                    </span>

                    <span className={item.completed ? "status-done" : "status-pending"}>
                      {item.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="task-actions">
                  <button
                    className="complete-button"
                    onClick={() => toggleComplete(item)}
                  >
                    {item.completed ? "Reopen" : "Complete"}
                  </button>

                  <button
                    className="edit-button"
                    onClick={() => editTask(item)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => deleteTask(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="dashboard-footer">
        <p>TaskFlow © 2026 | Stay Organized. Stay Productive.</p>
      </footer>
    </div>
  );
}

export default Dashboard;

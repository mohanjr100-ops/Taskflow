
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import "./App.css";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTasks(snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })));
        setLoading(false);
      },
      (error) => {
        console.error("Task loading error:", error);
        setLoading(false);
        alert("Unable to load tasks: " + error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!task.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "tasks"), {
        title: task.trim(),
        completed: false,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      });
      setTask("");
    } catch (error) {
      alert("Could not add task: " + error.message);
    }
  };

  const toggleTask = async (item) => {
    try {
      await updateDoc(doc(db, "tasks", item.id), {
        completed: !item.completed,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredTasks = tasks.filter((item) => {
    if (filter === "Active") return !item.completed;
    if (filter === "Completed") return item.completed;
    return true;
  });

  const completedCount = tasks.filter((item) => item.completed).length;
  const activeCount = tasks.length - completedCount;

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <h2 className="brand">TaskFlow<span>.</span></h2>
        <p className="sidebar-label">WORKSPACE</p>
        <p className="sidebar-link active">▦ &nbsp; My Tasks</p>
        <p className="sidebar-link">◷ &nbsp; Overview</p>
        <div className="sidebar-bottom">
          <p>Signed in as</p>
          <strong>{auth.currentUser?.email}</strong>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>My Tasks</h1>
            <p className="subtitle">Stay focused. Get things done.</p>
          </div>
          <div className="user-avatar">
            {(auth.currentUser?.email || "U")[0].toUpperCase()}
          </div>
        </header>

        <section className="stats">
          <article className="stat-card">
            <p>Total Tasks</p>
            <h2>{tasks.length}</h2>
          </article>
          <article className="stat-card">
            <p>In Progress</p>
            <h2>{activeCount}</h2>
          </article>
          <article className="stat-card">
            <p>Completed</p>
            <h2>{completedCount}</h2>
          </article>
        </section>

        <section className="task-panel">
          <div className="panel-heading">
            <div>
              <h2>Task List</h2>
              <p>Manage your daily activities</p>
            </div>
          </div>

          <form className="task-form" onSubmit={addTask}>
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What needs to be done?"
              aria-label="New task"
            />
            <button type="submit">+ Add Task</button>
          </form>

          <div className="filter-bar">
            {["All", "Active", "Completed"].map((name) => (
              <button
                key={name}
                className={filter === name ? "filter active-filter" : "filter"}
                onClick={() => setFilter(name)}
              >
                {name}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="empty-state">Loading tasks...</p>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks found</h3>
              <p>Add a task above to get started.</p>
            </div>
          ) : (
            <div className="task-list">
              {filteredTasks.map((item) => (
                <article className="task-item" key={item.id}>
                  <label className="task-title">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleTask(item)}
                    />
                    <span className={item.completed ? "completed-task" : ""}>
                      {item.title}
                    </span>
                  </label>
                  <button
                    className="delete-button"
                    onClick={() => deleteTask(item.id)}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Dashboard;

export default function Home() {
    const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "";
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>This is the main landing page of the application.</p>
      <button className="btn"><a href="/login">Login</a></button>
      <button className="btn"><a href="/register">Register</a></button>
    </div>
  );
}
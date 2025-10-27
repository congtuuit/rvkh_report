import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Search from "./pages/Search";
import Revernue from "./pages/Revernue";

console.log("API URL:", import.meta.env.VITE_API_URL);

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/doanh-thu" element={<Revernue />} />
          <Route path="/chat-bot-khoa-hoc" element={<Chat />} />
          <Route
            path="/chat"
            element={
              <div
                style={{
                  height: "90vh",
                }}
              >
                <Chat />
              </div>
            }
          />
          <Route path="/search" element={<Search />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;

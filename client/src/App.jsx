import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Room from "./pages/Room";
import ProtectedRoute from "./components/ProtectedRoute";
import RoomSelect from "./pages/RoomSelect";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/room-select" element={<RoomSelect />} />
      <Route path="/room/:roomId" element={<Room />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/room"
        element={
          <ProtectedRoute>
            <Room />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
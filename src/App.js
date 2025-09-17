import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import AddUser from "./components/AddUser";
import EditEmployee from "./components/EditEmployee";
import Logout from "./components/Logout";
import AutoLogout from "./components/AutoLogout";
import { useState } from "react";

export default function App() {
  const [user, setUser] = useState(null);
  return (
    <BrowserRouter>
      <AutoLogout>
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register  />} />
          <Route path="/home" element={<Home user={user} />} />
          <Route path="/addEmployee" element={<AddUser user={user} />} />
          <Route path="/editEmployee/:id" element={<EditEmployee user={user} />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </AutoLogout>
    </BrowserRouter>
  );
}

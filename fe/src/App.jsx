import "./App.css";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Service from "./screens/Service";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Bill from "./screens/Bill";
import Comment from "./screens/Comment";
import Notifications from "./screens/Notifications";
import Information from "./screens/Information";

function App() {
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Routes>
          <Route path="/" element={<Navbar />} />
          <Route path="/service" element={<Service />} />
          <Route path="/bill" element={<Bill />} />
          <Route path="/comment" element={<Comment />} />
          <Route path="/notification" element={<Notifications />} />
          <Route path="/information" element={<Information />} />
        </Routes>
      </LocalizationProvider>
    </>
  );
}

export default App;

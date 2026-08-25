import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/Login";

const App = () => {
  return (
    <BrowserRouter>
      <main className="mx-auto max-w-7xl">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;

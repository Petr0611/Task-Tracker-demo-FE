import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Layout from "./layouts/Layout";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Profile from "./pages/Proile";
import ForgotPasswordForm from "./features/auth/components/ForgotPasswordForm";
import ResetPasswordForm from "./features/auth/components/ResetPasswordForm";

function App() {
  return (
    <div>
      <nav></nav>
      <Layout>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;

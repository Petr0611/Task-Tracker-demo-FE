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
import ProjectTasks from "./pages/ProjectTasks";
import ConfirmInvitePage from "./pages/ConfirmInvitePage";
import InviteFormPage from "./features/projects/components/InviteFormPage";
import DeleteProjectPage from "./features/projects/components/DeleteProjectPage";
import EditProjectPage from "./features/projects/components/EditProjectPage";

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
          <Route path="/projects/:projectId/tasks" element={<ProjectTasks />} />
          <Route
            path="/projects/:projectId/invitations"
            element={<InviteFormPage />}
          />
          <Route path="/confirm-invite" element={<ConfirmInvitePage />} />
          <Route path="/projects/:projectId" element={<Projects />} />
          <Route
            path="/projects/:projectId/edit"
            element={<EditProjectPage />}
          />
          <Route
            path="/projects/:projectId/delete"
            element={<DeleteProjectPage />}
          />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;

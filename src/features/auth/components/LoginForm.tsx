import { useFormik } from "formik";
import * as Yup from "yup";
import {
  login,
  selectIsAuthenticated,
  selectLoginError,
} from "../slice/authSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { Link, useNavigate } from "react-router-dom";
import "../../../css/Auth.css";

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const loginError = useAppSelector(selectLoginError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
    }),
    onSubmit: (values) => {
      dispatch(login(values));
    },
  });

  const emailHasError = Boolean(formik.touched.email && formik.errors.email);
  const passwordHasError = Boolean(
    formik.touched.password && formik.errors.password,
  );

  return (
     <main className="auth-page" aria-labelledby="login-title">
      <section className="auth-wrapper">
        <button
          type="button"
          className="auth-back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <header className="auth-header">
          <span className="auth-label">Sign in</span>
          <h1 id="login-title" className="auth-title">
            Welcome back to ToDoBeDo
          </h1>
          <p className="auth-subtitle">
            Enter your email address and password to continue collaborating with your team.
          </p>
        </header>

        {isAuthenticated && (
          <div className="auth-status auth-status--success" role="status">
            Login successful! Redirecting you now.
          </div>
        )}

        {loginError && (
          <div className="auth-status auth-status--error" role="alert">
            {loginError}
          </div>
        )}
      

        <form onSubmit={formik.handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email" className="auth-field__label">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...formik.getFieldProps("email")}
              className={`auth-input ${emailHasError ? "auth-input--error" : ""}`}
              placeholder="you@example.com"
            />
            {emailHasError && (
              <p className="auth-error-message">{formik.errors.email}</p>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-field__label">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...formik.getFieldProps("password")}
              className={`auth-input ${
                passwordHasError ? "auth-input--error" : ""
              }`}
              placeholder="••••••••"
            />
            {passwordHasError && (
              <p className="auth-error-message">{formik.errors.password}</p>
            )}
          </div>

          <div className="auth-actions">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="auth-link"
            >
              Forgot password?
            </button>
            <Link to="/registration" className="auth-link">
              Create account
            </Link>
          </div>

        <button type="submit" className="auth-submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
};

export default LoginForm;

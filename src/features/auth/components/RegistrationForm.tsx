import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { register } from "../slice/authSlice";
import { useAppDispatch } from "../../../app/hooks";
import { Link, useNavigate } from "react-router-dom";
import "../../../css/Auth.css";

const RegistrationForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [registrationStatus, setRegistrationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);
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
    onSubmit: async (values) => {
      setRegistrationStatus("idle");
      setStatusMessage("");
      const dispatchResult = await dispatch(register(values));
      if (register.fulfilled.match(dispatchResult)) {
        setRegistrationStatus("success");
        setStatusMessage(
          "We have sent a confirmation link to your email. Please verify your inbox — you will be redirected to sign in shortly.",
        );

        redirectTimerRef.current = setTimeout(() => {
          navigate("/login");
        }, 2600);
      } else {
        setRegistrationStatus("error");
        setStatusMessage(
          "We could not complete your registration. Please try again.",
        );
      }
    },
  });

  const emailHasError = Boolean(formik.touched.email && formik.errors.email);
  const passwordHasError = Boolean(
    formik.touched.password && formik.errors.password,
  );

  return (
    <main className="auth-page" aria-labelledby="registration-title">
      <section className="auth-wrapper">
        <button
           type="button"
          className="auth-back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      <header className="auth-header">
          <span className="auth-label">Sign up</span>
          <h1 id="registration-title" className="auth-title">
            Create your ToDoBeDo account
          </h1>
          <p className="auth-subtitle">
            Register with your email address to launch projects, plan sprints, and keep your team aligned.
          </p>
        </header>

        {registrationStatus !== "idle" && statusMessage && (
          <div
            className={`auth-status ${
              registrationStatus === "success"
                ? "auth-status--success"
                : "auth-status--error"
            }`}
            role={registrationStatus === "success" ? "status" : "alert"}
          >
            {statusMessage}
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

          <button type="submit" className="auth-submit">
            Register
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link className="auth-link" to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default RegistrationForm;

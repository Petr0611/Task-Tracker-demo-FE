import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const formik = useFormik({
    initialValues: {
      newPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Please enter a new password"),
    }),
    onSubmit: async (values) => {
      try {
        await axios.post("/api/v1/auth/reset-password", {
          token,
          newPassword: values.newPassword,
        });
        setStatus("success");
      } catch (error) {
        console.error("Password reset failed:", error);
        setStatus("error");
      }
    },
  });

  return (
    <div className="mx-auto max-w-sm mt-10 p-6 bg-white border rounded-lg shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Reset Password</h2>
        <p className="text-sm text-gray-500">
          Enter a new password for your account
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Новый пароль
          </label>
          <input
            id="newPassword"
            type="password"
            {...formik.getFieldProps("newPassword")}
            className={`w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              formik.touched.newPassword && formik.errors.newPassword
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="••••••••"
          />
          {formik.touched.newPassword && formik.errors.newPassword && (
            <p className="text-sm text-red-500">{formik.errors.newPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save New Password
        </button>
      </form>

      {status === "success" && (
        <p className="text-green-600 text-sm text-center">
          Password successfully updated! You can now log in.
        </p>
      )}
      {status === "error" && (
        <p className="text-red-600 text-sm text-center">
          Failed to reset password. Please try again.
        </p>
      )}
    </div>
  );
};

export default ResetPasswordForm;

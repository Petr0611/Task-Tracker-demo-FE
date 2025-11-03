import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import axios from "axios";
import axiosInstance from "../../../lib/axiosInstance";

interface AdminChangePasswordProps {
  isAdminChanging: true;
  userId: string;
}

interface SelfChangePasswordProps {
  isAdminChanging?: false;
  userId?: undefined;
}

type ChangePasswordFormProps =
  | AdminChangePasswordProps
  | SelfChangePasswordProps;

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = (props) => {
  const { isAdminChanging } = props;
  const [message, setMessage] = useState<string | null>(null);

  const userId = isAdminChanging ? props.userId : undefined;

  const initialValues: ChangePasswordFormValues = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    oldPassword: isAdminChanging
      ? Yup.string()
      : Yup.string().required("Old password is required"),
    newPassword: Yup.string()
      .required("New password is required")
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Password confirmation is required"),
  });

  const handleSubmit = async (
    values: ChangePasswordFormValues,
    { resetForm, setSubmitting }: FormikHelpers<ChangePasswordFormValues>
  ): Promise<void> => {
    setMessage(null);

    try {
      if (isAdminChanging && userId) {
        await axiosInstance.put(`/users/${userId}/change-password`, {
          newPassword: values.newPassword,
        });
      } else {
        await axiosInstance.put("/users/change-password", {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        });
      }

      setMessage("Password changed successfully!");
      resetForm();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data ?? "Failed to change password");
      } else {
        setMessage("Unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow bg-white">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Change Password
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            {!isAdminChanging && (
              <div>
                <label htmlFor="oldPassword" className="block mb-1">
                  Current Password
                </label>
                <Field
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  className="w-full border rounded p-2"
                />
                <ErrorMessage
                  name="oldPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block mb-1">
                New Password
              </label>
              <Field
                type="password"
                id="newPassword"
                name="newPassword"
                className="w-full border rounded p-2"
              />
              <ErrorMessage
                name="newPassword"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block mb-1">
                Confirm New Password
              </label>
              <Field
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="w-full border rounded p-2"
              />
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {message && (
              <div className="text-center text-sm text-gray-700">{message}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 rounded bg-green-600 text-white p-2 hover:bg-green-500 disabled:opacity-50 transition"
            >
              {isSubmitting ? "Changing..." : "Confirm"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ChangePasswordForm;

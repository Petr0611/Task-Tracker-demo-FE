import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import axios from "axios";
import axiosInstance from "../../../lib/axiosInstance";
import "../../../css/Profile.css";

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
    <div className="profile-form">
      <h2 className="profile-title">Change Password</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            {!isAdminChanging && (
              <div>
                <label htmlFor="oldPassword" className="profile-field-label">
                  Current Password
                </label>
                <Field
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  className="profile-input"
                  placeholder="Enter your old password"
                />
                <ErrorMessage
                  name="oldPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="profile-field-label">
                New Password
              </label>
              <Field
                type="password"
                id="newPassword"
                name="newPassword"
                className="profile-input"
                placeholder="Enter your new password"
              />
              <ErrorMessage
                name="newPassword"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="profile-field-label">
                Confirm New Password
              </label>
              <Field
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="profile-input"
                placeholder="Confirm your new password"
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
              className="profile-button"
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

import { useFormik } from "formik";
import * as Yup from "yup";
import "../../../css/Project.css";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  createProject,
  getAllProjects,
  selectCreateProjectErrorMessage,
} from "../slice/projectsSlice";

interface ProjectFormProps {
  onCancel?: () => void;
  showCancelButton?: boolean;
}

const validationSchema = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .test("title-validation", function (value) {
      if (!value) return true;

      const onlyLatin = /^[A-Za-z0-9,.%:?&!$;*() \-]+$/.test(value);
      if (!onlyLatin) {
        return this.createError({
          message: "Title must contain only Latin characters (A–Z, a–z)",
        });
      }

      if (value.length < 3) {
        return this.createError({
          message: "Title must be at least 3 characters long",
        });
      }

      if (value.length > 150) {
        return this.createError({
          message: "Title must be less than 150 characters",
        });
      }

      const startsWithCapital = /^[A-Z]/.test(value);
      if (!startsWithCapital) {
        return this.createError({
          message: "Title must start with a capital English letter (A–Z)",
        });
      }

      return true;
    }),

  description: Yup.string()
    .required("Description is required")
    .test("description-validation", function (value) {
      if (!value) return true;

      const onlyLatin = /^[A-Za-z0-9,.%:?&!$;*() \-]+$/.test(value);
      if (!onlyLatin) {
        return this.createError({
          message: "Description must contain only Latin characters (A–Z, a–z)",
        });
      }

      if (value.length < 3) {
        return this.createError({
          message: "Description must be at least 3 characters long",
        });
      }

      if (value.length > 500) {
        return this.createError({
          message: "Description must be less than 500 characters",
        });
      }

      const startsWithCapital = /^[A-Z]/.test(value);
      if (!startsWithCapital) {
        return this.createError({
          message: "Description must start with a capital English letter (A–Z)",
        });
      }

      return true;
    }),
});

const ProjectForm = ({
  onCancel,
  showCancelButton = false,
}: ProjectFormProps) => {
  const dispatch = useAppDispatch();
  const projectError = useAppSelector(selectCreateProjectErrorMessage);

  const formik = useFormik<{ title: string; description: string }>({
    initialValues: {
      title: "",
      description: "",
    },

    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          title: values.title.trim(),
          description: values.description.trim(),
          invitations: [],
        };
        await dispatch(createProject(payload)).unwrap();
        await dispatch(getAllProjects());
        resetForm();
      } catch (error) {
        console.error(error);
        setSubmitting(false);
      }
    },
  });

  const titleHasError = Boolean(formik.touched.title && formik.errors.title);
  const descriptionHasError = Boolean(
    formik.touched.description && formik.errors.description
  );

  const serverFieldErrors = {
    title: Array.isArray(projectError)
      ? projectError.find((msg) => msg.toLowerCase().includes("title"))
      : null,
    description: Array.isArray(projectError)
      ? projectError.find((msg) => msg.toLowerCase().includes("description"))
      : null,
  };

  return (
    <div className="project-panel project-panel--narrow">
      <div className="project-panel__heading">
        <h1 className="project-panel__title">New Project</h1>
        <p className="project-panel__subtitle">
          Enter the project title and description
        </p>
        {projectError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 whitespace-pre-line">
            {Array.isArray(projectError) ? (
              <ul className="list-disc pl-5 space-y-1">
                {projectError.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            ) : (
              <p>{projectError}</p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={formik.handleSubmit} className="project-form">
        <div className="project-field">
          <label htmlFor="title" className="project-field__label">
            Title
          </label>
          <input
            id="title"
            type="text"
            {...formik.getFieldProps("title")}
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${
              titleHasError || serverFieldErrors.title
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="New Website Development"
            disabled={formik.isSubmitting}
          />
          {titleHasError && (
            <p className="text-sm text-red-500">{formik.errors.title}</p>
          )}
        </div>

        <div className="project-field">
          <label htmlFor="description" className="project-field__label">
            Description
          </label>
          <textarea
            id="description"
            {...formik.getFieldProps("description")}
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${
              descriptionHasError || serverFieldErrors.description
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="A Project to develop a new company website"
            rows={4}
            disabled={formik.isSubmitting}
          />
          {descriptionHasError && (
            <p className="text-sm text-red-500">{formik.errors.description}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="project-button project-button--primary"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Creating..." : "Create Project"}
          </button>

          {showCancelButton && (
            <button
              type="button"
              onClick={onCancel}
              className="project-button project-button--secondary"
              disabled={formik.isSubmitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;

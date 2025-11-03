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
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
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
      } finally {
        setSubmitting(false);
      }
    },
  });

  const titleHasError = Boolean(formik.touched.title && formik.errors.title);
  const descriptionHasError = Boolean(
    formik.touched.description && formik.errors.description
  );

  return (
    <div className="project-panel project-panel--narrow">
      <div className="project-panel__heading">
        <h1 className="project-panel__title">New Project</h1>
        <p className="project-panel__subtitle">
          Enter the project title and description
        </p>
        {projectError && (
          <div className="project-panel__notice">{projectError}</div>
        )}
      </div>

      <form onSubmit={formik.handleSubmit} className="project-form">
        <div className="project-field">
          <label htmlFor="title" className="project-field__label">
            Title
          </label>
          <div className="project-field__control">
            <input
              id="title"
              type="text"
              {...formik.getFieldProps("title")}
              className={`project-field__input ${
                titleHasError ? "project-field__input--error" : ""
              }`}
              placeholder="New Website Development"
              disabled={formik.isSubmitting}
            />
            {titleHasError && (
              <p className="project-field__error">{formik.errors.title}</p>
            )}
          </div>
        </div>

        <div className="project-field">
          <label htmlFor="description" className="project-field__label">
            Description
          </label>
          <div className="project-field__control">
            <textarea
              id="description"
              {...formik.getFieldProps("description")}
              className={`project-field__textarea ${
                descriptionHasError ? "project-field__textarea--error" : ""
              }`}
              placeholder="A Project to develop a new company website"
              rows={4}
              disabled={formik.isSubmitting}
            />
            {descriptionHasError && (
              <p className="project-field__error">{formik.errors.description}</p>
            )}
          </div>
        </div>

        <div className="project-actions">
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

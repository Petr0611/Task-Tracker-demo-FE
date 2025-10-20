import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  createProject,
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

const ProjectForm = ({ onCancel, showCancelButton = false }: ProjectFormProps) => {
  const dispatch = useAppDispatch();
  const projectError = useAppSelector(selectCreateProjectErrorMessage);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
    },
    
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        await dispatch(createProject(values)).unwrap();
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
    formik.touched.description && formik.errors.description,
  );

  return (
    <div className="space-y-6 rounded-lg border bg-white p-6 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">New Project</h1>
        <p className="text-sm text-gray-500">
          Enter the project title and description
        </p>
        {projectError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {projectError}
          </div>
        )}
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            {...formik.getFieldProps("title")}
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${titleHasError ? "border-red-500 focus:ring-red-500" : "border-input"}`}
            placeholder="New Website Development"
            disabled={formik.isSubmitting}
          />
          {titleHasError && (
            <p className="text-sm text-red-500">{formik.errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            {...formik.getFieldProps("description")}
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${descriptionHasError ? "border-red-500 focus:ring-red-500" : "border-input"}`}
            placeholder="A Project to develop a new company website"
            rows={4}
            disabled={formik.isSubmitting}
          />
          {descriptionHasError && (
            <p className="text-sm text-red-500">{formik.errors.description}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          Create Project
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:w-auto"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Creating..." : "Create Project"}
          </button>

          {showCancelButton && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 md:w-auto"
              disabled={formik.isSubmitting}
            >
              Отменить
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
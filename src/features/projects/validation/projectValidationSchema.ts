import * as Yup from "yup";
import {
  isLatinOnly,
  startsWithCapital,
} from "../../../lib/api/validationHalpers";

export const projectValidationSchema = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters long")
    .max(150, "Title must be less than 150 characters")
    .test(
      "latin-only",
      "Title must contain only Latin characters (A–Z, a–z)",
      (value) => isLatinOnly(value)
    )
    .test(
      "starts-with-capital",
      "Title must start with a capital English letter (A–Z)",
      (value) => startsWithCapital(value)
    ),

  description: Yup.string()
    .required("Description is required")
    .min(3, "Description must be at least 3 characters long")
    .max(500, "Description must be less than 500 characters")
    .test(
      "latin-only",
      "Description must contain only Latin characters (A–Z, a–z)",
      (value) => isLatinOnly(value)
    )
    .test(
      "starts-with-capital",
      "Description must start with a capital English letter (A–Z)",
      (value) => startsWithCapital(value)
    ),
});

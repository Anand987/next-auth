"use server";

import { createAuthSession } from "@/lib/auth";
import { hashUserPassword } from "@/lib/hash";
import { createUser } from "@/lib/users";
import { redirect } from "next/navigation";

const PASS_LEN = 8;

/**
 * Handles the user signup process by validating the provided email and password,
 * hashing the password, and creating a new user account. If validation fails, 
 * an error object is returned. If the signup is successfull, the user is redirected
 * to the training page.
 *
 * @param {Object} prevState - The previous state of the application (optional, can be used for tracking changes).
 * @param {FormData} formData - The form data containing user inputs, email and password.
 * @returns {Promise<Object>} A promise that resolves to an object containing errors (if any) 
 * or redirects the user upon successfull signup.
 * 
 * @throws {Error} Throws an error if an unexpected issue occurs during the signup process.
 */
export async function signup(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const errors = {};

  if (!email.includes("@") || !email.includes(".com") || email === "") {
    errors.email = "Please provide valid email address";
  }

  if (password.trim().length < PASS_LEN) {
    errors.password = `Password should be atleast ${PASS_LEN} char long`;
  }

  if (Object.keys(errors).length !== 0) {
    console.log("errors::", errors);
    return { errors };
  }

  const hashedPassword = hashUserPassword(password);

  try {
    const id = createUser(email, hashedPassword);
    await createAuthSession(id);
    redirect("/training");
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        errors: {
          email:
            "It seems like an account for the chosen email is already exists.",
        },
      };
    }
    throw error;
  }
}

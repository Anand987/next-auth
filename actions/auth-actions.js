"use server";

import { createAuthSession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, existingUserByEmail } from "@/lib/users";
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

/**
 * Handles the user login process by validating the provided email and password,
 * hashing the password, and logging a new user account. If validation fails,
 * an error object is returned. If the login is successfull, the user is redirected
 * to the training page.
 *
 * @param {Object} prevState - The previous state of the application (optional, can be used for tracking changes).
 * @param {FormData} formData - The form data containing user inputs, email and password.
 * @returns {Promise<Object>} A promise that resolves to an object containing errors (if any)
 * or redirects the user upon successfull login.
 *
 * @throws {Error} Throws an error if an unexpected issue occurs during the signup process.
 */
export async function login(prevState, formData) {
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

  const existingUser = existingUserByEmail(email);

  if (!existingUser) {
    return {
      errors: {
        email: "User not found, please check your credentials.",
      },
    };
  }

  const isValidPassword = verifyPassword(existingUser.password, password);

  if (!isValidPassword) {
    return {
      errors: {
        password: "Could not authenticate user, please check your credentials",
      },
    };
  }

  await createAuthSession(existingUser.id);
  redirect("/training");
}

export async function auth (mode, prevState, formData) {
  if (mode === 'login') {
    return login(prevState, formData);
  }
  return signup(prevState, formData);
}

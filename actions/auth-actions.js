"use server";

import { hashUserPassword } from "@/lib/hash";
import { createUser } from "@/lib/users";
import { redirect } from "next/navigation";

const PASS_LEN = 8;

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
    createUser(email, hashedPassword);
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

  redirect("/training");
}

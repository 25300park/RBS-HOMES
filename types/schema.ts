import { z } from "zod";

export const SignupFormSchema = z
  .object({
    // username: z
    //   .string()
    //   .min(2, { message: 'Username must be at least 2 characters long.' })
    //   .trim(),
    email: z.string().email({ message: "Please enter a valid email." }).trim(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(/[a-zA-Z]/, {
        message: "Password must contain at least one letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      // .regex(/[^a-zA-Z0-9]/, {
      //   message: 'Password must contain at least one special character.',
      // })
      .trim(),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"], // 오류가 발생할 필드를 지정
    message: "Passwords do not match.",
  });

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password field must not be empty." }),
});

export type FormState =
  | {
      errors?: {
        username?: string[];
        email?: string[];
        password?: string[];
        form?: string[];
      };
      message?: string;
      status?: number;
      email? : string;
      password? : string;
    }
  | undefined;

export type SessionPayload = {
  user_id: string | number;
  expires_at: Date;
};

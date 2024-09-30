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
      email?: string;
      password?: string;
    }
  | undefined;

export type SessionPayload = {
  user_id: string | number;
  expires_at: Date;
};

export const stepOneSchema = z.object({
  title: z.string().min(1, "Title must be specified"),
  // ownerName: z.string().min(3, "Owner's name must be specified"),
  // location: z.string().min(5, "Location must be at least 5 characters long"),
  // description: z.string().min(10, "Description must be at least 10 characters long"),
  price: z.number().min(1, "Price must be specified"),
  // location: z.string().min(1, "Locaiton must be specified"),
  saleType: z.string().min(1, "Sale type must be specified"),
  unitType: z.string().min(1, "Unit type must be specified"),
});

// Validation schema for Step 2
export const stepTwoSchema = z.object({
  bed: z.number().min(0, "At least 1 bedroom is required"),
  bath: z.number().min(1, "At least 1 bathroom is required"),
  area: z.number().min(1, "Area is required"),
  floor: z.number().min(1, "Floor of building is required"),
  furniture: z.string().min(1, "Furniture information is required"),
  interiored: z.string().min(1, "Interior status is required"),
  petPolicy: z.string().min(1, "Pet policy is required"),
  // amenity: z.array(z.string()).min(1, "At least one amenity must be selected"),
});

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
      .min(6, { message: "Password must be at least 6 characters long." })
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
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
});

export const EditPasswordSchema = z
  .object({
    prevPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." })
      .regex(/[a-zA-Z]/, {
        message: "Password must contain at least one letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .trim(),
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." })
      .regex(/[a-zA-Z]/, {
        message: "Password must contain at least one letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .trim(),
    newPasswordCheck: z.string().trim(),
  })
  .refine((data) => data.newPassword === data.newPasswordCheck, {
    path: ["newPasswordCheck"], // 오류가 발생할 필드를 지정
    message: "Passwords do not match.",
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
  latitude: z.number().min(1, "address must be specified"),
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

export const reservationSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z
      .string()
      .min(5, "Phone number must be at least 5 digits")
      .max(15, "Phone number cannot exceed 15 digits")
      .regex(/^[0-9+\-\s()]*$/, "Invalid phone number format"),
    message: z
      .string()
      .min(3, "Message must be at least 3 characters")
      .max(500, "Message cannot exceed 500 characters"),
    date: z.union([z.date(), z.literal(undefined)]),
    needsDiscussion: z.boolean().default(false),
    unitId: z.number(),
    userId: z.number().optional(),
  })
  .refine((data) => data.needsDiscussion || data.date !== undefined, {
    message: "Please either select a date or mark as 'Needs Discussion'",
    path: ["date"],
  });

export type ReservationFormData = z.infer<typeof reservationSchema>;

import { z } from "zod";

// Base schema for user signup data
export const signupBaseSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อจริง")
    .max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร"),
  lastName: z
    .string()
    .trim()
    .min(1, "กรุณากรอกนามสกุล")
    .max(100, "นามสกุลต้องไม่เกิน 100 ตัวอักษร"),
  email: z
    .string()
    .trim()
    .min(1, "กรุณากรอกอีเมล")
    .pipe(z.string().email("รูปแบบอีเมลไม่ถูกต้อง")),
  telephone: z
    .string()
    .trim()
    .min(9, "เบอร์โทรศัพท์ต้องมีความยาวอย่างน้อย 9 หลัก")
    .max(15, "เบอร์โทรศัพท์ต้องไม่เกิน 15 หลัก")
    .regex(/^[0-9\-+ ]+$/, "เบอร์โทรศัพท์ต้องประกอบด้วยตัวเลข"),
  positionName: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อตำแหน่งงาน")
    .max(150, "ชื่อตำแหน่งต้องไม่เกิน 150 ตัวอักษร"),
  departmentId: z
    .string()
    .trim()
    .min(1, "กรุณาเลือกหน่วยงานที่สังกัด"),
  image: z.string().optional().nullable(),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
    .max(100, "รหัสผ่านต้องไม่เกิน 100 ตัวอักษร"),
});

// Client form schema with confirm password
export const signupFormSchema = signupBaseSchema
  .extend({
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

// API Schema for receiving body (confirmPassword optional if sent)
export const signupApiSchema = signupBaseSchema.extend({
  confirmPassword: z.string().optional(),
});

export type SignupFormData = z.infer<typeof signupFormSchema>;
export type SignupApiData = z.infer<typeof signupApiSchema>;

import { z } from "zod";

export const createUserSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "กรุณากรอกอีเมล")
    .pipe(z.string().email("รูปแบบอีเมลไม่ถูกต้อง")),
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
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
    .max(100, "รหัสผ่านต้องไม่เกิน 100 ตัวอักษร"),
  role: z.enum(["user", "admin", "superadmin"]).optional().default("user"),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.string().email("รูปแบบอีเมลไม่ถูกต้อง"))
    .optional(),
  firstName: z.string().trim().max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร").optional(),
  lastName: z.string().trim().max(100, "นามสกุลต้องไม่เกิน 100 ตัวอักษร").optional(),
  telephone: z
    .string()
    .trim()
    .regex(/^[0-9\-+ ]*$/, "เบอร์โทรศัพท์ต้องประกอบด้วยตัวเลข")
    .optional(),
  positionName: z.string().trim().max(150, "ชื่อตำแหน่งต้องไม่เกิน 150 ตัวอักษร").optional(),
  departmentId: z.string().trim().optional(),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
    .max(100, "รหัสผ่านต้องไม่เกิน 100 ตัวอักษร")
    .optional()
    .or(z.literal("")),
  role: z.enum(["user", "admin", "superadmin"]).optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;

// Schema for updating personal profile (Owner only)
export const editProfileSchema = z.object({
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
  image: z.string().nullable().optional(),
});

export type EditProfileData = z.infer<typeof editProfileSchema>;

// Schema for changing password by account owner
export const changePasswordOwnerSchema = z
  .object({
    currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
    newPassword: z
      .string()
      .min(8, "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
      .max(100, "รหัสผ่านต้องไม่เกิน 100 ตัวอักษร"),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่านใหม่"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export type ChangePasswordOwnerData = z.infer<typeof changePasswordOwnerSchema>;

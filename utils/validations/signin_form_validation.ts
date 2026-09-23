import { z } from "zod";

export const signinSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "กรุณากรอกอีเมล")
    .pipe(z.string().email("รูปแบบอีเมลไม่ถูกต้อง")),
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน"),
  rememberMe: z.boolean().optional(),
});

export type SigninFormData = z.infer<typeof signinSchema>;

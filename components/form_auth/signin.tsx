"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signinSchema } from "@/utils/validations/signin_form_validation";
import { TextBox } from "@/components/form_ui/TextBox";
import { PasswordBox } from "@/components/form_ui/PasswordBox";
import { CheckBox } from "@/components/form_ui/CheckBox";
import { Button } from "@/components/form_ui/Button";
import { TextAlert } from "@/components/form_ui/TextAlert";
import { MessageBox } from "@/components/form_ui/MessageBox";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function SigninForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    const result = signinSchema.safeParse({
      email,
      password,
      rememberMe,
    });

    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    // Mock API sign-in delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="my-auto max-w-md w-full mx-auto">
      {success ? (
        /* Success Animation and Message */
        <MessageBox
          title="ลงชื่อเข้าใช้งานสำเร็จ!"
          text="ยินดีต้อนรับเข้าสู่ระบบ ขณะนี้ระบบกำลังนำทางคุณไปยังหน้าแผงควบคุมหลัก..."
          variant="success"
          showSpinner={true}
        />
      ) : (
        /* Main Form */
        <div>
          {/* Titles */}
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mb-2 font-sans">
            ลงชื่อเข้าใช้งานระบบ
          </h1>
          <p className="text-sm text-slate-600 mb-8">
            กรุณากรอกบัญชีอีเมลและรหัสผ่านเพื่อดำเนินการต่อ
          </p>

          {generalError && (
            <TextAlert
              text={generalError}
              variant="error"
              className="mb-5"
            />
          )}

          {/* Form Elements */}
          <form noValidate onSubmit={handleSignIn} className="space-y-5">
            <TextBox
              id="email"
              name="email"
              type="text"
              label="อีเมลบัญชีผู้ใช้"
              placeholder="example@domain.com"
              value={email}
              error={fieldErrors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              disabled={loading}
            />

            <PasswordBox
              id="password"
              name="password"
              label="รหัสผ่านของท่าน"
              placeholder="กรอกรหัสผ่านของคุณ"
              value={password}
              error={fieldErrors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              disabled={loading}
            />

            {/* Keep signed in */}
            <CheckBox
              id="remember-me"
              name="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              label="จดจำการใช้งานในอุปกรณ์นี้"
              disabled={loading}
            />

            {/* Sign In Button */}
            <Button
              type="submit"
              loading={loading}
              fullWidth
              variant="primary"
              text="เข้าสู่ระบบ"
            />
          </form>

          {/* Sub-actions block under sign in button */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <Link
              href="#"
              className="text-[#1a73e8] hover:text-[#1557b0] font-medium transition-colors hover:underline"
            >
              ลืมรหัสผ่านใช่หรือไม่?
            </Link>
            <div className="flex items-center text-slate-500">
              <span>ยังไม่มีบัญชีใช่ไหม?</span>
              <Link
                href="/u/signup"
                className="ml-1.5 text-[#1a73e8] hover:text-[#1557b0] font-semibold transition-colors hover:underline"
              >
                ลงทะเบียนใช้งาน
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signinSchema } from "@/utils/validations/signin_form_validation";
import { TextBox } from "@/components/form_controls/TextBox";
import { PasswordBox } from "@/components/form_controls/PasswordBox";
import { CheckBox } from "@/components/form_controls/CheckBox";
import { Button } from "@/components/form_controls/Button";
import { TextAlert } from "@/components/form_controls/TextAlert";
import { MessageBox } from "@/components/form_controls/MessageBox";
import { ShieldCheck, LogIn, Lock, ArrowRight } from "lucide-react";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function SigninForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
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

    try {
      const res = await fetch("/api/user/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoading(false);
        setGeneralError(data.message || "เกิดข้อผิดพลาดในการลงชื่อเข้าใช้งาน");
        return;
      }

      setLoading(false);
      setSuccess(true);

      // Broadcast auth state change so NavBar and listeners update immediately
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("auth-state-changed", { detail: data.user })
        );
      }

      // Redirect to /p/home
      setTimeout(() => {
        router.push(data.redirectTo || "/p/home");
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      console.error("Sign in error:", err);
      setLoading(false);
      setGeneralError(
        "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง"
      );
    }
  };

  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto transition-all duration-300">
      {success ? (
        /* Success Animation and Message */
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-10 backdrop-blur-sm animate-fade-in">
          <MessageBox
            title="ลงชื่อเข้าใช้งานสำเร็จ!"
            text="ยินดีต้อนรับเข้าสู่ระบบ Yuenyan ระบบกำลังนำทางคุณไปยังหน้าหลัก..."
            variant="success"
            showSpinner={true}
          />
        </div>
      ) : (
        /* Main Login Card */
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-10 transition-all">
          {/* Header & Brand Identity */}
          <div className="text-center mb-8">
            {/* System Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary border border-primary-border/60 text-xs font-semibold mb-4 tracking-wide shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ระบบยืนยันตัวตนรวมศูนย์ (SSO)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
              ลงชื่อเข้าใช้งาน
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
              เข้าถึงบริการดิจิทัลและระบบงานภายในทั้งหมดด้วยบัญชีผู้ใช้เดียว
            </p>
          </div>

          {/* Error Alert */}
          {generalError && (
            <TextAlert
              text={generalError}
              variant="error"
              className="mb-6 shadow-2xs"
              onClose={() => setGeneralError("")}
            />
          )}

          {/* Form */}
          <form noValidate onSubmit={handleSignIn} className="space-y-5">
            {/* Email Input */}
            <div>
              <TextBox
                id="email"
                name="email"
                type="email"
                label="อีเมลบัญชีผู้ใช้"
                placeholder="name@example.com"
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
            </div>

            {/* Password Input */}
            <div>
              <PasswordBox
                id="password"
                name="password"
                label="รหัสผ่าน"
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
            </div>

            {/* Options Row: Remember Me & Forgot Password */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center">
                <CheckBox
                  id="remember-me"
                  name="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  label="จดจำการใช้งานในระบบ"
                  disabled={loading}
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/u/forgot-password"
                  className="text-xs sm:text-sm text-primary hover:text-primary-hover font-semibold transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                loading={loading}
                loadingText="กำลังตรวจสอบข้อมูล..."
                fullWidth
                variant="primary"
                size="lg"
                text="เข้าสู่ระบบ"
                rightIcon={<LogIn className="w-4 h-4 ml-1" />}
                className="shadow-md hover:shadow-lg transition-all"
              />
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">
                หรือ
              </span>
            </div>
          </div>

          {/* Sign Up Navigation Callout */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-700">
                ยังไม่มีบัญชีผู้ใช้งานใช่หรือไม่?
              </p>
              <p className="text-xs text-slate-500">
                ลงทะเบียนเพื่อขอรับสิทธิ์เข้าถึงระบบงาน
              </p>
            </div>
            <Link
              href="/u/signup"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-primary/30 text-primary hover:bg-primary hover:text-white text-xs sm:text-sm font-semibold transition-all shadow-2xs group shrink-0"
            >
              <span>สมัครสมาชิก</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Security Footnote */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Lock className="w-3 h-3" />
            <span>ปลอดภัยด้วยการเข้ารหัสข้อมูลมาตรฐาน SSL 256-bit</span>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signupFormSchema, SignupFormData } from "@/utils/validations/signup_form_validation";
import { TextBox } from "@/components/form_ui/TextBox";
import { PasswordBox } from "@/components/form_ui/PasswordBox";
import { SelectBox } from "@/components/form_ui/SelectBox";
import { Button } from "@/components/form_ui/Button";
import { TextAlert } from "@/components/form_ui/TextAlert";
import { MessageBox } from "@/components/form_ui/MessageBox";
import { SelectOption } from "@/utils/types/selectbox_props";

interface DepartmentItem {
  id: string;
  name: string;
}

type FieldErrors = Partial<Record<keyof SignupFormData, string>>;

export default function SignupForm() {
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
    positionName: "",
    departmentId: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Departments dropdown options
  const [departments, setDepartments] = useState<SelectOption[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  // Load department list for dropdown
  useEffect(() => {
    let isMounted = true;
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/departments");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && isMounted) {
          const options: SelectOption[] = json.data.map((d: DepartmentItem) => ({
            value: d.id,
            label: d.name,
          }));
          setDepartments(options);
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
      } finally {
        if (isMounted) setLoadingDepartments(false);
      }
    }

    fetchDepartments();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    // Client-side validation with Zod
    const result = signupFormSchema.safeParse(formData);
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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setGeneralError(data.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
        return;
      }

      // Success
      setSuccess(true);
      setTimeout(() => {
        router.push("/u/signin");
      }, 2500);
    } catch (err: unknown) {
      console.error("Signup error:", err);
      setGeneralError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-auto max-w-lg w-full mx-auto py-6">
      {success ? (
        /* Success Message & Auto Redirect */
        <div className="space-y-4">
          <MessageBox
            title="ลงทะเบียนสำเร็จ!"
            text="ระบบได้สร้างบัญชีผู้ใช้งานสำหรับคุณเรียบร้อยแล้ว ขณะนี้กำลังนำทางไปยังหน้าเข้าสู่ระบบ..."
            variant="success"
            showSpinner={true}
          />
          <div className="text-center pt-2">
            <Link
              href="/u/signin"
              className="text-sm font-semibold text-[#1a73e8] hover:text-[#1557b0] hover:underline"
            >
              ไปยังหน้าเข้าสู่ระบบทันที &rarr;
            </Link>
          </div>
        </div>
      ) : (
        /* Signup Form */
        <div>
          {/* Header */}
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mb-2 font-sans">
            ลงทะเบียนผู้ใช้งานระบบ
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            กรอกข้อมูลของท่านเพื่อสมัครสมาชิกสำหรับเข้าใช้งานระบบจองห้องประชุม Korjong
          </p>

          {/* General alert */}
          {generalError && (
            <TextAlert
              text={generalError}
              variant="error"
              className="mb-5"
            />
          )}

          <form noValidate onSubmit={handleSignUp} className="space-y-4">
            {/* Name row: First name & Last name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextBox
                id="firstName"
                name="firstName"
                label="ชื่อจริง"
                placeholder="ระบุชื่อจริง"
                value={formData.firstName}
                error={fieldErrors.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                disabled={loading}
              />

              <TextBox
                id="lastName"
                name="lastName"
                label="นามสกุล"
                placeholder="ระบุนามสกุล"
                value={formData.lastName}
                error={fieldErrors.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <TextBox
              id="email"
              name="email"
              type="email"
              label="อีเมลบัญชีผู้ใช้"
              placeholder="example@domain.com"
              value={formData.email}
              error={fieldErrors.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={loading}
            />

            {/* Telephone & Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextBox
                id="telephone"
                name="telephone"
                type="tel"
                label="เบอร์โทรศัพท์"
                placeholder="เช่น 0812345678"
                value={formData.telephone}
                error={fieldErrors.telephone}
                onChange={(e) => handleChange("telephone", e.target.value)}
                disabled={loading}
              />

              <TextBox
                id="positionName"
                name="positionName"
                label="ตำแหน่งงาน"
                placeholder="เช่น นักวิชาการคอมพิวเตอร์"
                value={formData.positionName}
                error={fieldErrors.positionName}
                onChange={(e) => handleChange("positionName", e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Department Selection */}
            <SelectBox
              id="departmentId"
              name="departmentId"
              label="หน่วยงานที่สังกัด"
              placeholder={
                loadingDepartments
                  ? "กำลังโหลดรายชื่อหน่วยงาน..."
                  : "เลือกหน่วยงานที่ท่านสังกัด"
              }
              value={formData.departmentId}
              options={departments}
              error={fieldErrors.departmentId}
              onChange={(e) => handleChange("departmentId", e.target.value)}
              disabled={loading || loadingDepartments}
            />

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordBox
                id="password"
                name="password"
                label="รหัสผ่าน"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                value={formData.password}
                error={fieldErrors.password}
                onChange={(e) => handleChange("password", e.target.value)}
                disabled={loading}
              />

              <PasswordBox
                id="confirmPassword"
                name="confirmPassword"
                label="ยืนยันรหัสผ่าน"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={formData.confirmPassword}
                error={fieldErrors.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                loading={loading}
                fullWidth
                variant="primary"
                text="ลงทะเบียนสมัครสมาชิก"
              />
            </div>
          </form>

          {/* Bottom link to sign in */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-sm text-slate-600">
            <span>มีบัญชีผู้ใช้งานอยู่แล้ว?</span>
            <Link
              href="/u/signin"
              className="text-[#1a73e8] hover:text-[#1557b0] font-semibold transition-colors hover:underline"
            >
              ลงชื่อเข้าใช้งาน
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

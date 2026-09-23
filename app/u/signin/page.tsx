import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CarouselContainer from "@/components/signin_carousel/carousel_container";
import SigninForm from "@/components/form_auth/signin";
import { CarouselItem } from "@/utils/types/carousel_item";

// Carousel images data
const CAROUSEL_IMAGES: CarouselItem[] = [
  {
    src: "/signin_carousel/korjong_info_01.png",
    alt: "จองง่าย ไม่ต้องประสานหลายขั้นตอน",
    title: "จองง่าย ไม่ต้องประสานหลายขั้นตอน",
    location: "",
    description: "ค้นหาห้องประชุม เลือกวันและเวลาที่ต้องการ พร้อมส่งคำขอจองได้อย่างรวดเร็ว ลดขั้นตอนการติดต่อและประสานงานแบบเดิม"
  },
  {
    src: "/signin_carousel/korjong_info_02.png",
    alt: "เห็นตารางว่างแบบชัดเจน",
    title: "เห็นตารางว่างแบบชัดเจน",
    location: "",
    description: "ตรวจสอบสถานะห้องประชุมและช่วงเวลาที่ถูกจองได้ทันที ช่วยให้เลือกห้องและเวลาที่เหมาะสมได้ง่าย ลดปัญหาการจองซ้ำหรือการใช้ห้องไม่ตรงเวลา"
  },
  {
    src: "/signin_carousel/korjong_info_03.png",
    alt: "จัดการการจองได้อย่างเป็นระบบ",
    title: "จัดการการจองได้อย่างเป็นระบบ",
    location: "",
    description: "รวมข้อมูลการจองไว้ในระบบเดียว ทั้งรายละเอียดการประชุม ผู้จอง ห้อง และช่วงเวลา ทำให้ผู้ใช้งานและผู้ดูแลสามารถตรวจสอบข้อมูลได้สะดวก"
  },
  {
    src: "/signin_carousel/korjong_info_04.png",
    alt: "ใช้ทรัพยากรองค์กรได้คุ้มค่า",
    title: "ใช้ทรัพยากรองค์กรได้คุ้มค่า",
    location: "",
    description: "ช่วยให้องค์กรบริหารการใช้ห้องประชุมและทรัพยากรส่วนกลางได้อย่างมีประสิทธิภาพ พร้อมรองรับการต่อยอดสู่ระบบจองทรัพย์สินประเภทอื่นในอนาคต"
  }
];

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex bg-[#f8f9fa] font-sans antialiased text-slate-800">
      {/* Outer Wrapper for responsive layouts */}
      <div className="w-full flex min-h-screen">

        {/* LEFT SIDE: Image Carousel (Hidden on screens < lg) */}
        <div className="hidden lg:block lg:w-1/2 p-5 relative select-none">
          <CarouselContainer
            items={CAROUSEL_IMAGES}
            className="w-full h-full relative overflow-hidden rounded-3xl shadow-2xl bg-slate-900"
          />
        </div>

        {/* RIGHT SIDE: Google Themed Sign In Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-20 bg-white">

          {/* Mobile Header (Hidden on desktop) */}
          <div className="flex lg:hidden justify-between items-center w-full mb-8">
            <div className="flex items-center gap-2 text-slate-900">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <Image
                  src="/logo_korjong_64.png"
                  alt={"Korjong : ขอจอง"}
                  width={64}
                  height={64}
                  priority
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-base tracking-wider text-slate-800">Korjong : ขอจอง</span>
            </div>
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              กลับสู่หน้าหลัก
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Main Sign In Form Component */}
          <SigninForm />
        </div>

      </div>
    </div>
  );
}

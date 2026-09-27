import Seo from "@/components/seo/Seo";
import Hero from "@/sections/Hero";
import Stats from "@/sections/Stats";
import Features from "@/sections/Features";
import Pipeline from "@/sections/Pipeline";
import Showcase from "@/sections/Showcase";
import CTA from "@/sections/CTA";

export default function Landing() {
  return (
    <>
      <Seo
        title="In 3D cá nhân hóa từ ảnh – Tạo mô hình 3D bằng AI"
        description="In 3D cá nhân hóa từ một tấm ảnh: InnerStyle dùng AI tạo mô hình, figure 3D của riêng bạn, xem trước bằng AR và đặt in 3D giao tận nơi."
        canonical="https://www.innerstyle.online/"
      />
      <Hero />
      <Stats />
      <Features />
      <Pipeline />
      <Showcase />
      <CTA />
    </>
  );
}

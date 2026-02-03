import Image from "next/image";

export default function HomeLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative h-full">
      <Image
        src="/home-bg.png"
        alt=""
        fill
        className="-z-10 object-cover"
        priority
      />
      {children}
    </div>
  );
}

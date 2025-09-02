export default function HomeLayout({ children }: LayoutProps<"/">) {
  return <div className="mx-auto w-[90%] py-8">{children}</div>;
}

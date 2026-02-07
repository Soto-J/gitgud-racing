export default function HomeLayout({ children }: LayoutProps<"/">) {
  return <div className="relative min-h-full">{children}</div>;
}

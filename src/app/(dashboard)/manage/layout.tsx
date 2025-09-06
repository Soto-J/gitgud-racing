export default function ManageLayout({ children }: LayoutProps<"/manage">) {
  return <div className="mx-auto w-[90%] py-8">{children}</div>;
}

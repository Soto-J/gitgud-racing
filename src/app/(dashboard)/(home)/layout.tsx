interface MembersLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: MembersLayoutProps) {
  return <div className="mx-auto w-[90%] py-8">{children}</div>;
}

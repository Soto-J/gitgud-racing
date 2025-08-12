interface MembersLayoutProps {
  children: React.ReactNode;
}

export default function MembersLayout({ children }: MembersLayoutProps) {
  return <div className="mx-auto w-[90%] py-8">{children}</div>;
}

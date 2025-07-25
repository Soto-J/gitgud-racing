import React from "react";
interface MembersLayoutProps {
  children: React.ReactNode;
}

export default function MembersLayout({ children }: MembersLayoutProps) {
  return <div>{children}</div>;
}

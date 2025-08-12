interface ProfilelayoutProps {
  children: React.ReactNode;
}
export default function Profilelayout({ children }: ProfilelayoutProps) {
  return <div className="w-[90%] mx-auto py-8">{children}</div>;
}

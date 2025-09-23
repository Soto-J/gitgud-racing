export default function Schedulelayout({ children }: LayoutProps<"/schedule">) {
  return (
    <div className="min-h-[93.4%] w-full bg-[url('/Schedule_background.png')] bg-cover bg-fixed bg-center bg-no-repeat p-8">
      {children}
    </div>
  );
}

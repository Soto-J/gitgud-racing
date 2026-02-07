export default function LeagueScheduleLayout({
  children,
}: LayoutProps<"/league-schedule">) {
  return (
    <div className="flex w-full flex-1 flex-col bg-[url('/Schedule_background.png')] bg-cover bg-fixed bg-center bg-no-repeat px-20 py-10">
      {children}
    </div>
  );
}

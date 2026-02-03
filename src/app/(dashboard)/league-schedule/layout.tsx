export default function LeagueScheduleLayout({
  children,
}: LayoutProps<"/league-schedule">) {
  return (
    <div className="min-h-[93.4%] w-full bg-[url('/Schedule_background.png')] bg-cover bg-fixed bg-center bg-no-repeat px-20 py-10">
      {children}
    </div>
  );
}

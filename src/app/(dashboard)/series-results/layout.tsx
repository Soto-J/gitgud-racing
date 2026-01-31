export default function SeriesResultsLayout({
  children,
}: LayoutProps<"/series-results">) {
  return <div className="mx-auto w-[90%] py-8">{children}</div>;
}

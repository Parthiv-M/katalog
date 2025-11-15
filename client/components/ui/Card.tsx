export default function Card({
  children,
  classes
}: {
  children: React.ReactNode;
  classes?: string
}) {
    return <div className={`h-full w-full rounded-sm ` + classes}>{children}</div>
}
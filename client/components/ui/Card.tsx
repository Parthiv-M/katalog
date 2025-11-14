export default function Card({
  children,
  classes
}: {
  children: React.ReactNode;
  classes?: string
}) {
    return <div className={`h-full w-full bg-gray-100/10 rounded-sm ` + classes}>{children}</div>
}
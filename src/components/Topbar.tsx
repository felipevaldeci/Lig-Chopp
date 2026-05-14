interface TopbarProps {
  title: string
  user: { name: string; role: string }
}

export default function Topbar({ title, user }: TopbarProps) {
  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-6 z-20">
      <h1 className="text-zinc-900 font-semibold text-lg">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-zinc-900 leading-tight">{user.name}</p>
          <p className="text-xs text-zinc-500 capitalize">{user.role}</p>
        </div>
        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-amber-700 text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
        </div>
      </div>
    </header>
  )
}

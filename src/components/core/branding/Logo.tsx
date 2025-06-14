import Link from "next/link"

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center">
      <div className="flex items-center">
        <div className="bg-[var(--sidebar-selected)] rounded-md w-8 h-8 flex items-center justify-center text-white font-bold text-lg">
          S
        </div>
        <span className="ml-2 font-semibold text-lg">SIKSO</span>
      </div>
    </Link>
  )
}

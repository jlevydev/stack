'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo } from 'react'

interface NavbarLinkProps {
  href: string;
  text: string;
  prefix: string;
}
export default memo(function NavbarLink ({ href, text, prefix }: NavbarLinkProps) {
  const path = usePathname()
  const active = path.startsWith(prefix)
  return (
    <Link
      href={href}
      className={`${active ? 'bg-gray-light text-black  border-solid border-gray-light h-[calc(100%_+_4px)] font-semibold' : 'text-white h-full'} self-end sm:self-auto flex items-center no-underline text-sm sm:text-lg grow box-border`}
    >
      <div className={`grow sm:min-w-[10px] rounded-tr-lg sm:rounded-tr-none sm:rounded-br-lg bg-primary h-full border-gray-dark border-solid ${active ? 'border-r-4 border-t-4 sm:border-t-0 sm:border-b-4' : ''}`}/>
      <div className={`px-4 text-center ${active ? 'pt-1 sm:pb-2' : ''}`}>
        {text}
      </div>
      <div className={`grow sm:min-w-[10px] sm:rounded-bl-lg rounded-tl-lg sm:rounded-tl-none bg-primary h-full border-gray-dark border-solid ${active ? 'border-l-4 border-t-4 sm:border-t-0 sm:border-b-4' : ''}`}/>
    </Link>
  )
})

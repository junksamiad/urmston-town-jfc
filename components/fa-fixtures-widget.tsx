"use client"

import { useEffect } from 'react'

interface FAFixturesWidgetProps {
  leagueCode: string
  className?: string
}

declare global {
  interface Window {
    lrcode: string
  }
}

export function FAFixturesWidget({ leagueCode, className = "" }: FAFixturesWidgetProps) {
  useEffect(() => {
    // Set the league code globally for FA's script
    window.lrcode = leagueCode

    // Create and load the FA script
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://fulltime.thefa.com/client/api/cs1.js'
    script.async = true

    // Add the script to the document
    document.head.appendChild(script)

    // Cleanup function
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [leagueCode])

  return (
    <div className={`fa-fixtures-widget ${className}`}>
      <div 
        id={`lrep${leagueCode}`} 
        className="min-h-[200px] p-4 bg-white rounded-lg shadow-sm border"
      >
        Data loading....
      </div>
    </div>
  )
}
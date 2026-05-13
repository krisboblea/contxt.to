'use client'

import { useEffect, useRef } from 'react'

interface QrCodeProps {
  url: string
  size?: number
}

export function QrCode({ url, size = 120 }: QrCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function render() {
      if (!containerRef.current) return
      const QRCode = (await import('qrcode')).default
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, url, {
        width: size,
        margin: 1,
        color: { dark: '#18181b', light: '#ffffff' },
      })
      containerRef.current!.innerHTML = ''
      containerRef.current!.appendChild(canvas)
    }
    render()
  }, [url, size])

  return (
    <div
      ref={containerRef}
      className="inline-block rounded-lg border p-2 bg-white"
    />
  )
}


import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET() {
  const filePath = path.join(process.cwd(), '../lib/.playcanvas-react.mdc')
  const content = await readFile(filePath, 'utf8')

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
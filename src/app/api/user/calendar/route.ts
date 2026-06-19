import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

function escapeIcs(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll(',', '\\,').replaceAll(';', '\\;').replaceAll('\n', '\\n')
}

function icsDate(date: Date) {
  return date.toISOString().replaceAll('-', '').replaceAll(':', '').replace(/\.\d{3}Z$/, 'Z')
}

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const tasks = await prisma.task.findMany({
    where: { userId: auth.userId, status: 'PENDING', dueDate: { not: null } },
    orderBy: { dueDate: 'asc' },
  })
  const events = tasks.map(task => {
    const start = task.dueDate!
    const end = new Date(start.getTime() + (task.estimatedMinutes || 30) * 60_000)
    return [
      'BEGIN:VEVENT',
      `UID:${task.id}@ascend-system`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${escapeIcs(task.title)}`,
      `DESCRIPTION:${escapeIcs(task.description || 'Tarefa do Ascend System')}`,
      'END:VEVENT',
    ].join('\r\n')
  })
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ascend System//PT-BR', ...events, 'END:VCALENDAR'].join('\r\n')
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ascend-calendar.ics"',
    },
  })
}

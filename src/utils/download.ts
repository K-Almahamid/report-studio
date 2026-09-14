export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function slugifyFilename(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) {
    return isoDate
  }
  return `${day}/${month}/${year}`
}

const longMonthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export function formatLongDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  const monthIndex = Number.parseInt(month ?? '', 10) - 1
  if (!year || !day || monthIndex < 0 || monthIndex > 11) {
    return isoDate
  }
  return `${Number.parseInt(day, 10)} ${longMonthNames[monthIndex]} ${year}`
}

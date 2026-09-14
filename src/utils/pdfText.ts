/** Standard PDF Helvetica fonts only support WinAnsi; strip/replace common Unicode from user content. */
export function toWinAnsiSafeText(text: string): string {
  let result = text
    .replace(/\u2022/g, '-')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2713\u2714]/g, '[x]')
    .replace(/[\u2717\u2718]/g, '[ ]')

  result = result.replace(/[^\u0020-\u007E\u00A0-\u00FF]/g, '')
  return result
}

// eslint-disable-next-line prefer-regex-literals, no-useless-escape
const regexp = new RegExp('\{\{(.+?)\}\}', 'g')

function makeString (object) {
  if (object == null) return ''
  return '' + object
}

export function interpolate (str, data, lng) {
  let match, value

  function regexSafe (val) {
    return val.replace(/\$/g, '$$$$')
  }

  // regular escape on demand
  // eslint-disable-next-line no-cond-assign
  while (match = regexp.exec(str)) {
    value = match[1].trim()
    if (typeof value !== 'string') value = makeString(value)
    if (!value) value = ''
    value = regexSafe(value)
    str = str.replace(match[0], data[value] || value)
    regexp.lastIndex = 0
  }
  return str
}

// eslint-disable-next-line prefer-regex-literals, no-useless-escape
const regexp = new RegExp('\{\{(.+?)\}\}', 'g')

const UNSAFE_KEYS = ['__proto__', 'constructor', 'prototype']

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
    // Skip prototype-chain key lookups so a polluted Object.prototype
    // cannot leak into the substitution result.
    const subst = UNSAFE_KEYS.indexOf(value) > -1 ? value : (data[value] || value)
    str = str.replace(match[0], subst)
    regexp.lastIndex = 0
  }
  return str
}

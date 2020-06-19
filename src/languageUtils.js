export function formatLanguageCode(code) {
  return code;
}

export function getLanguagePartFromCode(code) {
  if (code.indexOf('-') < 0) return code;

  let specialCases = ['NB-NO', 'NN-NO', 'nb-NO', 'nn-NO', 'nb-no', 'nn-no'];
  let p = code.split('-');
  return specialCases.indexOf(code) > -1 ? p[1].toLowerCase() : p[0];
}

const normalize = (str) => {
  if (!str) return '';
  return str.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

console.log('airport-transfer:', normalize('airport-transfer'));
console.log('Airport transfer (with space):', normalize('Airport transfer '));

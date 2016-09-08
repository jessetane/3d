var E = 0.000001
module.exports = function (i) {
  if (i < E && i > -E) return 0
  return i
}

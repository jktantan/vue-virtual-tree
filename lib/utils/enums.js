/**
 * check type enum
 * @type {{half: number, check: number, uncheck: number}}
 */
const checkEnum = {
  check: 1,
  uncheck: 0,
  half: 2,
}
const joinTypeEnum = {
  start: 1,
  end: -1,
  center: 0,
}
const showEnum = {
  unshow: 0,
  closeShow: 1,
  show: 2,
}
const treeType = {
  select: 'select',
  checkbox: 'checkbox',
  radio: 'radio',
}
export { checkEnum, joinTypeEnum, showEnum, treeType }

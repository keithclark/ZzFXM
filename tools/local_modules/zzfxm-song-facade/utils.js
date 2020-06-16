/**
 * Sets an array to a given length and adds empty slots to it, or removes
 * existing slots if the new size is smaller the the current length
 *
 * @param {Array} arr The array to modify
 * @param {Number} length The new length
 * @param {*} value A new value to fill the array with
 */
export const setArrayLength = (arr, length, value = null) => {
  if (arr.length > length) {
    while (arr.length > length) {
      arr.pop()
    }
  } else {
    while (arr.length < length) {
      arr.push(value === null ? [] : value)
    }
  }
}

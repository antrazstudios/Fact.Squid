exports.removeObjectinArray = (arr, attr, value) => {
  var i = arr.length
  while (i--) {
    if (arr[i] && arr[i].hasOwnProperty(attr) && (arguments.length > 2 && arr[i][attr] === value)) {
      arr.splice(i, 1)
    }
  }
  return arr
}

exports.filterMethod = (obj, columns, value) => {
  return obj.filter((row) => {
    for (let i = 0; i < columns.length - 1; i++) {
      if (String(row[columns[i].key]).toLowerCase().indexOf(value.toLowerCase()) !== -1) {
        return true
      }
    }
  })
}

exports.getEmojiURL = (code) => {
  return '/assets/images/emoji-72x72/' + code + '.png'
}

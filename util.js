function logError(message) {
    console.log('\u001b[' + 31 + 'm' + message + '\u001b[0m')
}

function logPositive(message) {
    console.log('\u001b[' + 32 + 'm' + message + '\u001b[0m')
}

function keepCharacters(string, charList, makeDS = false) {
    var result = string.split("").filter(char => charList.includes(char))

    if(makeDS) {
        for(var j = result.length - 1; j > 0 ; j--) {
            if(result[j] == result[j - 1]) {
                result.splice(j,1)
            }
        }
    }

    return result.join("")
}

function alternatingString(symbol1, symbol2, length) {
    result = ""
    for(var i = 0; i < length; i++) {
        result += (i % 2 == 0) ? symbol1 : symbol2
    }
    return result
}

function badPattern(s) {
    pattern = "(.).*(?!\\1)(.)"
    for(var i = 0; i < s; i++) {
        pattern += (i % 2 == 0) ?  ".*(\\1)" : ".*(\\2)"
    }
    return new RegExp(pattern)
}

module.exports = {logError, logPositive, keepCharacters, alternatingString,
                  badPattern}
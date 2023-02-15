function logError(message) {
    console.log('\u001b[' + 31 + 'm' + message + '\u001b[0m')
}

function logPositive(message) {
    console.log('\u001b[' + 32 + 'm' + message + '\u001b[0m')
}

function PadToLength(string, len) {
    while(string.length < len) {
        string += " "
    }
    return string
}

function isEquivalent(seq1, seq2) {
    
    if(seq1.length != seq2.length) {
        return false
    }

    var symbolMap = new Map()
    var valueList = []
    for(var i = 0; i < seq1.length; i++) {
        if(!symbolMap.has(seq1[i])) {
            if(valueList.includes(seq2[i])) {
                return false
            }
            symbolMap.set(seq1[i], seq2[i])
            valueList.push(seq2[i])
        } else {
            if(symbolMap.get(seq1[i]) != seq2[i]) {
                return false
            }
        }
    }

    return true
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

function reverseString(s) {
    return s.split("").reverse().join("")
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
                  badPattern, isEquivalent, reverseString, PadToLength}
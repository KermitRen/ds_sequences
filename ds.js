const util = require("./util")

const symbols = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

function genDSseq(n, s) {
    var queue = [{seq:"",count:0}]
    var results = []
    while(queue.length != 0) {
        var element = queue.shift()
        const validSymbols = symbols.slice(0, Math.min(n, element.count+1))

        for(var i=0; i < validSymbols.length; i++) {
            if(element.seq.slice(-1) == validSymbols[i]) { continue }
            var newSequence = element.seq + validSymbols[i]
            var newCount = Math.min(n, element.count+(i == validSymbols.length-1 ? 1 : 0))
            if(isDSseqFast(newSequence, newCount, s)) {
                queue.push({seq:newSequence, count: newCount})
                results.push(newSequence)
            }
        }
    }

    const longestDSsequence = results[results.length - 1]
    util.logPositive("Generated " + results.length + " sequences")
    util.logPositive("Longest sequence is " + longestDSsequence)
    util.logPositive("Longest sequence has length " + longestDSsequence.length)
}

function isDSseqFast(sequence, n, s, log = false) {
    const lastSymbol = sequence.slice(-1)
    const subSymbols = symbols.slice(0, n)
    for(var i = 0; i < subSymbols.length; i++) {
        const symbol = subSymbols[i]
        if(symbol == lastSymbol) { continue }
        var seq = util.keepCharacters(sequence, [symbol, lastSymbol], makeDS = true)
        var forbiddenPattern1 = util.alternatingString(symbol, lastSymbol, s + 2)
        var forbiddenPattern2 = util.alternatingString(lastSymbol, symbol, s + 2)
        if(seq.includes(forbiddenPattern1) || seq.includes(forbiddenPattern2)) {
            if(log) {util.logError("Sequence contains forbidden pattern")}
            return false
        }
    }
    
    if(log) {util.logPositive("" + sequence + " is a DS(" + n + ", " + s + ")-sequence")}
    return true
}

function isDSseq(sequence, n, s, log = false) {

    //Verify n
    const subSymbols = symbols.slice(0, n)
    for(var i = 0; i < sequence.length; i++) {
        if(!subSymbols.includes(sequence[i])) {
            if(log) {util.logError("Sequence contains invalid symbol")}
            return false
        }
    }

    //Verify 'No Duplicates'
    for(var i = 0; i < sequence.length - 1; i++) {
        if(sequence[i]== sequence[i + 1]) {
            if(log) {util.logError("Sequence contains identical neighbors")}
            return false
        }
    }

    //Verify s
    return isDSseqFast(sequence, n, s, log)
}

module.exports = {symbols, genDSseq, isDSseq}
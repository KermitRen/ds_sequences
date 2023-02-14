const util = require("./util")

function sequenceToLineSegmentLP(sequence) {
    const epsilon = -0.001
    var symbols = []
    var lp = "Maximize \n obj: \n "
    var firstLast = new Map()
    for (var i = 0; i < sequence.length; i++) {
        if (!symbols.includes(sequence[i])) {
            var first = sequence.indexOf(sequence[i])+1
            var last = sequence.lastIndexOf(sequence[i])+1
            firstLast.set(sequence[i], {first: first, last: last})
            symbols.push(sequence[i])
            lp += sequence[i] + "a + " + sequence[i] + "b + "
        }
    }
    lp = lp.slice(0,-3) + " \n Subject To \n"
    
    for (var i = 1; i < symbols.length; i++) {
        var index = firstLast.get(symbols[i]).first
        lp += "C" + i + ": " + index + " " + symbols[i] + "a + " + symbols[i] + "b "
        lp += "- " + index + " " + sequence[index-2] + "a - " + sequence[index-2] + "b <= " + epsilon + "\n"
    }

    var constraintCounter = symbols.length - 1
    for (var i = 2; i < sequence.length + 1; i++) {
        //rule: left symbol is not last occurence, right symbol is not first occurence
        const leftSymbol = sequence[i-2]
        const rightSymbol = sequence[i-1]
        if (firstLast.get(leftSymbol).last != i-1 && firstLast.get(rightSymbol).first != i) {
            lp += "C" + (constraintCounter + 1) + ": " + i + " " + leftSymbol + "a + " + leftSymbol + "b "
            lp += "- " + i + " " + rightSymbol + "a - " + rightSymbol + "b = 0\n"
            constraintCounter++
        }
    }
    // if not exist skæringspunkt mellem to symboler, så kan vi enforce skæring i 
    // alle skæringspunkter mellem symbol1 og symbolAllePånær2 og endpoint mellem de to symboler.

    lp += "End"
    return lp
}


module.exports = {sequenceToLineSegmentLP}
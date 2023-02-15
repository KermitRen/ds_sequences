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
    var intersections = []
    for (var i = 2; i < sequence.length + 1; i++) {
        //rule: left symbol is not last occurence, right symbol is not first occurence
        const leftSymbol = sequence[i-2]
        const rightSymbol = sequence[i-1]
        if (firstLast.get(leftSymbol).last != i-1 && firstLast.get(rightSymbol).first != i) {
            lp += "C" + (constraintCounter + 1) + ": " + i + " " + leftSymbol + "a + " + leftSymbol + "b "
            lp += "- " + i + " " + rightSymbol + "a - " + rightSymbol + "b = 0\n"
            constraintCounter++
            intersections.push((leftSymbol + rightSymbol).split("").sort().join(""))
        }
    }

    // if not exist skæringspunkt mellem to symboler, så kan vi enforce skæring i 
    // alle skæringspunkter mellem symbol1 og symbolAllePånær2 og endpoint mellem de to symboler.
    for(var i = 0; i < symbols.length - 1; i++) {
        for(var j = i + 1; j < symbols.length; j++) {
            const symbol1 = symbols[i]
            const symbol2 = symbols[j]
            if(!intersections.includes(symbol1 + symbol2)) {
                if(firstLast.get(symbol1).last > firstLast.get(symbol2).first) {
                    foundSymbol2 = false
                    index = 0
                    for(var k = 0; k < sequence.length; k++) {
                        if(foundSymbol2) {
                            if(sequence[k] == symbol1) {
                                break
                            } else if(sequence[k] == symbol2) {
                                index = k
                            }
                        } else {
                            if(sequence[k] == symbol2) {
                                foundSymbol2 = true
                                index = k
                            }
                        }
                    }
                    lp += "C" + (constraintCounter + 1) + ": " + (index + 2) + " " + symbol2 + "a + " + symbol2 + "b "
                    lp += "- " + (index + 2) + " " + symbol1 + "a - " + symbol1 + "b <= 0\n"
                    constraintCounter++
                }
            }
        }
    }

    lp += "End"
    return lp
}


module.exports = {sequenceToLineSegmentLP}
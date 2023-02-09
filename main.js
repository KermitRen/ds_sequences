const symbols = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

function genDSseq(n,s) {
    var queue = [{seq:"",count:0}]
    var results = []
    while(queue.length != 0) {
        var element = queue.shift()
        const validSymbols = symbols.slice(0,element.count+1)

        for(var i=0; i < validSymbols.length; i++) {
            var symbol = validSymbols[i]
            if(element.seq.slice(-1) == symbol) {
                continue
            }
            var newSequence = element.seq+symbol
            var newCount = Math.min(n-1, element.count+(i == validSymbols.length-1 ? 1 : 0))
            if(isDSseq(newSequence, n, s)) {
                queue.push({seq:newSequence, count: newCount})
                results.push(newSequence)
                //console.log(newSequence)
            }
        }
    }
    console.log(results.slice(-1))
}

function isDSseq(sequence,n,s) {
    const lastSymbol = sequence.slice(-1)
    const subSymbols = symbols.slice(0,n)
    for(var i = 0; i < subSymbols.length; i++) {
        const symbol = subSymbols[i]
        if(symbol == lastSymbol) {
            continue
        }
        var subSequence = sequence.split("").filter(cha => cha == lastSymbol || cha == symbol)
        for(var j = subSequence.length-1; j > 0 ; j--) {
            if(subSequence[j] == subSequence[j-1]) {
                subSequence.splice(j,1)
            }
        }
        subSequence = subSequence.join("")
        var forbiddenPattern1 = ""
        var forbiddenPattern2 = ""
        for(var j = 0; j < s+2; j++) {
            if(j % 2 == 0) {
                forbiddenPattern1 += lastSymbol
                forbiddenPattern2 += symbol
            } else {
                forbiddenPattern1 += symbol
                forbiddenPattern2 += lastSymbol
            }
        }
        if(subSequence.includes(forbiddenPattern1) || subSequence.includes(forbiddenPattern2)) {
            return false
        }
    }
    return true
}

genDSseq(5,4)
//console.log(isDSseq("ABAB", 2, 2))
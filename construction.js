const util = require("./util")

function C(k, m) {
    if (k == 1) {
        return 1
    }
    if (m == 1) {
        return 2*C(k-1, 2)
    }
    var mu = C(k, m-1)
    return mu*C(k-1, mu)
}

function constructSequence(k, m) {
    var result = {N: m*C(k,m), L: C(k,m), seq: []}

    // Case 1
    if (k == 1) {
        for (var i = 0; i < m; i++) {
            result.seq.push({index: i+1, fan: 1})
        }
        return result
    }

    // Case 2
    if (k == 2) {
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < m; j++) {
                result.seq.push({index: j+1, fan: i+1})
            }
            for (var j = m-1; j > 0; j--) {
                result.seq.push({index: j, fan: i+1})
            }
        }
        return result
    }

    // Case 3
    if (m == 1) {
        var startingSeq = constructSequence(k-1, 2)
        /*
        var numberOfFans = startingSeq.L
        for (var i = 0; i < startingSeq.seq.length; i++) {
            if (startingSeq.seq[i].index == 1) {
                result.seq.push(startingSeq.seq[i])
            } else {
                result.seq.push({index: 1, fan: startingSeq.seq[i].fan + numberOfFans})
            }
        }
        */

        result.seq = startingSeq.seq.map(e => { return {index: 1, fan: e.index + (e.fan-1)*2}})
        return result
    }

    // General case (k >= 3, m > 1)
    var SPrime = constructSequence(k, m-1)
    var SPrimes = []
    var mu = C(k, m-1)
    var nu = C(k-1, mu)
    for (var j = 0; j < nu; j++) {
        var SPrimeCopy = JSON.parse(JSON.stringify(SPrime))
        for (var i = 0; i < SPrime.seq.length; i++) {
            SPrimeCopy.seq[i].copy = j+1
        }
        //console.log(SPrimeCopy)
        SPrimes.push(SPrimeCopy)
    }
    var SStar = constructSequence(k-1, mu)
    var currentFan = null
    var currentFanIndex = 1
    for (var i = 0; i < SStar.seq.length; i++) {
        SStar.seq[i].star = m
        if (SStar.seq[i].fan == currentFan) {
            if (SStar.seq[i].index == currentFanIndex+1) {
                currentFanIndex++
                if (currentFanIndex == mu) {
                    var symbolCopy = JSON.parse(JSON.stringify(SStar.seq[i]))
                    SStar.seq.splice(i, 0, symbolCopy)
                }
            } else {
                currentFan = null
            }
        } else {
            if (SStar.seq[i].index == 1) {
                currentFan = SStar.seq[i].fan
                currentFanIndex = 1
            } else {
                currentFan = null
            }
        }
    }
    
    // Step 4
    for (var j = 0; j < nu; j++) {
        SPrime = SPrimes[j]
        //console.log(SPrime)
        for (var i = 0; i < mu; i++) {
            var index = SPrime.seq.findIndex(e => e.fan == i+1 && e.index == (m-1))
            var copy = JSON.parse(JSON.stringify(SPrime.seq[index]))
            var copy2 = JSON.parse(JSON.stringify(copy))
            copy2.index = copy2.index + 1
            SPrime.seq.splice(index+1, 0, copy2)
            SPrime.seq.splice(index+2, 0, copy)
        }
        //console.log("SPrime", SPrime)
    }

    // Step 5
    for (var j = 0; j < nu; j++) {
        SPrime = SPrimes[j]
        var fanStart = SStar.seq.findIndex(e => e.fan == j+1 && e.index == (1) && e.hasOwnProperty("star"))
        SStar.seq.splice(fanStart, mu, ...SPrime.seq)
        //console.log(j, SStar.seq)
    }

    // Reformat sequence
    SStar.seq = SStar.seq.map(e => {
        if (e.hasOwnProperty("star")) {
            e.copy = e.fan
            e.fan = e.index
            e.index = e.star
        }
        return {index: e.index, fan: e.fan + (e.copy-1)*mu}
    })
    //console.log(SStar.seq)

    return SStar
}

function symbolizeSequence(seqObj) {
    var result = ""
    var numberOfSymbols = 0
    var symbolMap = new Map()
    for (var i = 0; i < seqObj.seq.length; i++) {
        var symbolObject = "" + seqObj.seq[i].index + seqObj.seq[i].fan
        if (symbolMap.has(symbolObject)) {
            result += symbolMap.get(symbolObject)
        } else {
            symbolMap.set(symbolObject, util.symbols[numberOfSymbols])
            numberOfSymbols++
            result += symbolMap.get(symbolObject)
        }
    }
    return result
}

module.exports = {constructSequence, symbolizeSequence, C}
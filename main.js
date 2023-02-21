const util = require("./util")
const ds = require("./ds")
const lp_solver = require("./lp_solver")
const ds3lp = require("./ds3lp")

function gatherData(n, s) {
    console.time('Gen Time');
    var DSSequences = ds.genDSseq(n,s)
    console.timeEnd('Gen Time');
    console.time('Pruning Time');
    var prunedDSSequences = []//ds.pruneRedundantSequences(DSSequences)
    console.timeEnd('Pruning Time');
    var maxLength = DSSequences[DSSequences.length - 1].length
    var maxLengthSequences = DSSequences.filter(seq => seq.length == maxLength)

    console.log()
    util.logPositive("Finished gathering data for n = " + n + ", s = " + s + ": \n")
    util.logPositive("Found " + DSSequences.length + " sequences")
    util.logPositive("Where " + maxLengthSequences.length + " had the maximum length of " + maxLength)
    util.logPositive("Example of a max-sequence: " + DSSequences[DSSequences.length - 1])
    util.logPositive("Found " + prunedDSSequences.length + " structurally different sequences")
}

async function realizeSeqAsLineSegments(n) {
    var DSSequences = ds.genDSseq(n,3)
    var prunedDSSequences = ds.pruneRedundantSequences(DSSequences)

    for (var i = 0; i < prunedDSSequences.length; i++) {
        var lp = ds3lp.toLineSegmentLP(prunedDSSequences[i])
        var solution = await lp_solver.solveLP(lp, log = false)
        if (solution.Status != "Optimal") {
            util.logError(solution.Status)
            console.log(prunedDSSequences[i])
        } else {
            util.logPositive(solution.Status)
        }
    }
}

/*
var badSeq = []
badSeq.push("ABCADCEBECEDE")
badSeq.push("ABACADCEBECEDE")
badSeq.push("ABCADCBEBECEDE")
badSeq.push("ABACADCBEBECEDE")
badSeq.push("ABCADADCEBECEDE")
badSeq.push("ABACADADCEBECEDE")
badSeq.push("ABCADADCBEBECEDE")
badSeq.push("ABACADADCBEBECEDE")
*/

/*
const n3 = "ABACACBC" 
const n4 = "ABCBADADBDCD"

var lp = ds3lp.toLineSegmentLP(n4)
lp_solver.solveLP(lp, log = true)*/

var results = ds.genDSseqPruned(5,3)
console.log(results.length)

const util = require("./util")
const ds = require("./ds")
const lp_solver = require("./lp_solver")
const ds3lp = require("./ds3lp")

function gatherData(n, s) {
    var DSSequences = ds.genDSseq(n,s)
    var prunedDSSequences = ds.pruneRedundantSequences(DSSequences)
    var maxLength = DSSequences[DSSequences.length - 1].length
    var maxLengthSequences = DSSequences.filter(seq => seq.length == maxLength)

    console.log()
    util.logPositive("Finished gathering data for n = " + n + ", s = " + s + ": \n")
    util.logPositive("Found " + DSSequences.length + " sequences")
    util.logPositive("Where " + maxLengthSequences.length + " had the maximum length of " + maxLength)
    util.logPositive("Example of a max-sequence: " + DSSequences[DSSequences.length - 1])
    util.logPositive("Found " + prunedDSSequences.length + " structurally different sequences")
}

/*
const n3 = "ABACACBC" 
const n4 = "ABCBADADBDCD"

var lp = ds3lp.sequenceToLineSegmentLP(n3)
lp_solver.solveLP(lp)
*/

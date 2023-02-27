const util = require("./util")
const ds = require("./ds")
const lp_solver = require("./lp_solver")
const ds3lp = require("./ds3lp")

function gatherData(n, s) {
    var DSData = ds.genDSseqPruned(n, s, verbose = true)
    var DSSequences = DSData.all
    var prunedDSSequences = DSData.pruned
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

    console.log()
    util.logPositive("Attempting to realize all DS(" + n + ", 3)-Sequenecs as line segments")
    var prunedDSSequences = ds.genDSseqPruned(n,3)
    var infeasibleSequences = []
    util.logPositive("Finished generating " + prunedDSSequences.length + " sequences")

    for (var i = 0; i < prunedDSSequences.length; i++) {
        var lp = ds3lp.toLineSegmentLP(prunedDSSequences[i])
        var solution = await lp_solver.solveLP(lp, log = false)
        if (solution.Status != "Optimal") {
            infeasibleSequences.push(prunedDSSequences[i])
        }
    }
    console.log()
    if(infeasibleSequences.length == 0) {
        util.logPositive("All sequences were realizable with fixed x-coordinates")
        return
    }
    
    const goodSequenceCount = prunedDSSequences.length - infeasibleSequences.length
    util.logPositive("" + goodSequenceCount + " were realizable with fixed x-coordinates")
    util.logError("The following " + infeasibleSequences.length + " were not:")
    util.logError(infeasibleSequences)

    console.log()
    util.logPositive("Attempting to realize remaining sequences with random x-coordinates")
    const maxIterations = 1000
    var veryInfeasibleSequences = []
    for (var i = 0; i < infeasibleSequences.length; i++) {
        var counter = 0
        var lp = ds3lp.toLineSegmentLP(infeasibleSequences[i])
        var randomLp = ds3lp.randomizeXcoord(lp, infeasibleSequences[i])
        var solution = await lp_solver.solveLP(randomLp)
        while (solution.Status == "Infeasible" && counter < maxIterations) {
            randomLp = ds3lp.randomizeXcoord(lp, infeasibleSequences[i])
            solution = await lp_solver.solveLP(randomLp)
            counter++
        }
        if (counter == 1000 ) {
            veryInfeasibleSequences.push(infeasibleSequences[i])
        }
    }

    if(veryInfeasibleSequences.length == 0) {
        util.logPositive("All remaining sequences were realizable with random x-coordinates")
        return
    }

    util.logError("The following " + veryInfeasibleSequences.length + " sequences were still not realizable:")
    util.logError(veryInfeasibleSequences)
}

realizeSeqAsLineSegments(6)
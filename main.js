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
    //var DSSequences = ds.genDSseq(n,3)
    //var prunedDSSequences = ds.pruneRedundantSequences(DSSequences)
    var prunedDSSequences = ds.genDSseqPruned(n,3)
    var infeasibleSequences = []

    for (var i = 0; i < prunedDSSequences.length; i++) {
        var lp = ds3lp.toLineSegmentLP(prunedDSSequences[i])
        var solution = await lp_solver.solveLP(lp, log = false)
        if (solution.Status != "Optimal") {
            //util.logError(solution.Status)
            //console.log(prunedDSSequences[i])
            infeasibleSequences.push(prunedDSSequences[i])
        }
    }
    
    util.logError("Found " + infeasibleSequences.length + " infeasible out of " + prunedDSSequences.length)
    util.logError(infeasibleSequences)
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
    util.logError("Very infeasible:\n" + veryInfeasibleSequences)
}

async function test() {
    const n3 = "ABACADADCBEBECEDE"
    var lp = ds3lp.toLineSegmentLP(n3)
    var randomLp = ds3lp.randomizeXcoord(lp, n3)
    var solution = await lp_solver.solveLP(randomLp)
    var counter = 0
    while (solution.Status == "Infeasible" && counter < 10000) {
        randomLp = ds3lp.randomizeXcoord(lp, n3)
        solution = await lp_solver.solveLP(randomLp)
        counter++
        console.log(solution.Status)
    }
    console.log(solution)
    console.log(counter)
}



const n3 = "ABACACBC" 
const n4 = "ABCBADADBDCD"

//var lp = ds3lp.toCubicLP(n3)
//lp_solver.solveLP(lp, log = true, cubic = true)

realizeSeqAsLineSegments(6)
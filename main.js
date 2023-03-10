const util = require("./util")
const ds = require("./ds")
const lp_solver = require("./lp_solver")
const ds3lp = require("./ds3lp")
const ls = require("./line_segment")
const poly = require("./polynomial")

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
        const lp_builder = ls.toLineSegmentLP(prunedDSSequences[i])
        var lp = lp_builder.getProgram()
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
    const maxIterations = 10000
    var veryInfeasibleSequences = []
    for (var i = 0; i < infeasibleSequences.length; i++) {
        var counter = 0
        const lp_builder = ls.toLineSegmentLP(infeasibleSequences[i])
        lp_builder.randomizeXCoordinates()
        var randomLP = lp_builder.getProgram()
        var solution = await lp_solver.solveLP(randomLP)
        while (solution.Status != "Optimal" && counter < maxIterations) {
            lp_builder.randomizeXCoordinates()
            randomLP = lp_builder.getProgram()
            solution = await lp_solver.solveLP(randomLP)
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

async function realizeSeqAsQuadratics(n) {
    console.log()
    util.logPositive("Attempting to realize all DS(" + n + ", 2)-Sequenecs as quadratic functions")
    var DSSequences = ds.genDSseq(n, 2)
    var infeasibleSequences = []
    util.logPositive("Finished generating " + DSSequences.length + " sequences")

    for (var i = 0; i < DSSequences.length; i++) {
        if(DSSequences[i].length == 1) { continue }
        const lp_builder = poly.toQuadraticLP(DSSequences[i])
        const lp = lp_builder.getProgram()
        const solution = await lp_solver.solveLP(lp)
        if (solution.Status != "Optimal") {
            infeasibleSequences.push(DSSequences[i])
        }
    }

    console.log()
    if(infeasibleSequences.length == 0) {
        util.logPositive("All sequences were realizable with fixed x-coordinates")
        return
    } else {
        const goodSequenceCount = DSSequences.length - infeasibleSequences.length
        util.logPositive("" + goodSequenceCount + " were realizable with fixed x-coordinates")
        util.logError("The following " + infeasibleSequences.length + " were not:")
        util.logError(infeasibleSequences)
    }
}

realizeSeqAsLineSegments(5)
//realizeSeqAsQuadratics(1)

async function test() {
    const str = "ABCBA"
    const lp_builder = ls.toLineSegmentLP(str)
    lp_builder.randomizeXCoordinates()
    const lp = lp_builder.getProgram()
    const solution = await lp_solver.solveLP(lp, log = true)
    console.log(lp_builder.coordinates)
    ls.printLineSegments(solution)
}

//test()
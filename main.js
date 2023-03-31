const util = require("./util")
const ds = require("./ds")
const lp_solver = require("./lp_solver")
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

const FuncType = {
    LINESEGMENT: 0,
    QUADRATIC: 1,
    CUBIC: 2,
    RELAXEDCUBIC: 3,
}

async function realizationTest(n, funcType, randomize = true, maxIterations = 10000) {

    switch (funcType) {
        case FuncType.LINESEGMENT: 
        util.logPositive("\nAttempting to realize all DS(" + n + ", 3)-Sequenecs as line segments"); break
        case FuncType.QUADRATIC: 
        util.logPositive("\nAttempting to realize all DS(" + n + ", 2)-Sequenecs as quadratic functions"); break
        case FuncType.CUBIC: 
        util.logPositive("\nAttempting to realize all DS(" + n + ", 3)-Sequenecs as cubic functions"); break
        case FuncType.RELAXEDCUBIC: 
        util.logPositive("\nAttempting to realize all DS(" + n + ", 3)-Sequenecs as a non-contiguous")
        util.logPositive("lower envelope sequence of cubic functions")
    }
    var DSSequences
    switch (funcType) {
        case FuncType.LINESEGMENT: DSSequences = ds.genDSseqPruned(n, 3); break
        case FuncType.QUADRATIC: DSSequences = ds.pruneReverse(ds.genDSseq(n,2)); break
        case FuncType.CUBIC: DSSequences = ds.pruneReverse(ds.genDSseq(n,3)); break
        case FuncType.RELAXEDCUBIC: DSSequences = ds.genDSseqTotalPruning(n, 3); break
    }
    util.logPositive(DSSequences)
    var infeasibleSequences = []
    util.logPositive("Finished generating " + DSSequences.length + " sequences")

    for (var i = 0; i < DSSequences.length; i++) {
        if(DSSequences[i] == "A") { continue }
        var lp_builder
        switch (funcType) {
            case FuncType.LINESEGMENT: lp_builder = ls.toLineSegmentLP(DSSequences[i]); break
            case FuncType.QUADRATIC: lp_builder = poly.toQuadraticLP(DSSequences[i]); break
            case FuncType.CUBIC: lp_builder = poly.toCubicLP(DSSequences[i]); break
            case FuncType.RELAXEDCUBIC: lp_builder = poly.toRelaxedCubicLP(DSSequences[i]); break
        }
        var lp = lp_builder.getProgram()
        var solution = await lp_solver.solveLP(lp, log = false)
        if (solution.Status != "Optimal") {
            infeasibleSequences.push(DSSequences[i])
        }
    }
    console.log()
    if(infeasibleSequences.length == 0) {
        util.logPositive("All sequences were realizable with fixed x-coordinates")
        return
    }
    
    const goodSequenceCount = DSSequences.length - infeasibleSequences.length
    util.logPositive("" + goodSequenceCount + " were realizable with fixed x-coordinates")
    util.logError("The following " + infeasibleSequences.length + " were not:")
    util.logError(infeasibleSequences)

    //Randomization
    if(!randomize) { return }
    console.log()
    util.logPositive("Attempting to realize remaining sequences with random x-coordinates")
    var veryInfeasibleSequences = []
    for (var i = 0; i < infeasibleSequences.length; i++) {
        var counter = 0
        var lp_builder
        switch (funcType) {
            case FuncType.LINESEGMENT: lp_builder = ls.toLineSegmentLP(DSSequences[i]); break
            case FuncType.QUADRATIC: lp_builder = poly.toQuadraticLP(DSSequences[i]); break
            case FuncType.CUBIC: lp_builder = poly.toCubicLP(DSSequences[i]); break
            case FuncType.RELAXEDCUBIC: lp_builder = poly.toRelaxedCubicLP(DSSequences[i]); break
        }
        lp_builder.randomizeXCoordinates()
        var randomLP = lp_builder.getProgram()
        var solution = await lp_solver.solveLP(randomLP)
        while (solution.Status != "Optimal" && counter < maxIterations) {
            lp_builder.randomizeXCoordinates()
            randomLP = lp_builder.getProgram()
            solution = await lp_solver.solveLP(randomLP)
            counter++
        }
        //console.log(counter)
        if (counter == maxIterations ) {
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

async function test() {
    const str = "ABACACBC"
    const lp_builder = poly.toRelaxedCubicLP(str)
    var lp = lp_builder.getProgram()
    var solution = await lp_solver.solveLP(lp)
    var counter = 0
    while(solution.Status != "Optimal") {
        lp_builder.randomizeXCoordinates()
        var lp = lp_builder.getProgram()
        var solution = await lp_solver.solveLP(lp)
        counter++
        if(counter%10000 == 0) {
            util.logError("10.000 attempts")
        }
    }
    console.log(solution.Status)
    console.log(counter)
    console.log()
    poly.printPolynomials(solution, 3)
}


//var seqs = ds.genDSseqTotalPruning(6,3)
//util.logPositive(seqs.length)

realizationTest(5, FuncType.RELAXEDCUBIC)

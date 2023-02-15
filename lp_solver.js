const util = require("./util")
var highs = null

const PROBLEM = "Maximize \n obj: \n Aa \n Subject To \n c1: Aa <= 10 \n End" 

async function test() {
    const highs = await getHighs();
    const sol = highs.solve(PROBLEM);
    printSolution(sol)
}

async function solveLP(lp, log = false) {
    if(!highs) {
        highs = await getHighs();
    }
    const sol = highs.solve(lp)
    if(log) { printSolution(sol) }
    return sol
}

async function getHighs() {
    const highs_settings = {
        locateFile: (file) => "https://lovasoa.github.io/highs-js/" + file
    };
    
    const highs_promise = await require("highs")(highs_settings)
    return highs_promise
}

function printSolution(sol) {
    util.logPositive("Finished with status: " + sol.Status + "\n")

    var count = 0
    var str = ""
    for (var x in sol.Columns) {
        count++
        if(count % 2 == 0) {
            str = util.PadToLength(str, 18)
            str += "" + x + ": " + sol.Columns[x].Primal 
            util.logPositive(str)
            str = ""
        } else {
            str += "" + x + ": " + sol.Columns[x].Primal 
        }
    }

}

module.exports = {test, solveLP}
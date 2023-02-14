const highs_settings = {
    locateFile: (file) => "https://lovasoa.github.io/highs-js/" + file
  };

const highs_promise = require("highs")(highs_settings)

const PROBLEM = `Maximize
obj:
    x1 + 2 x2 + 4 x3 + x4
Subject To
c1: - x1 + x2 + x3 + 10 x4 <= 20
c2: x1 - 4 x2 + x3 <= 30
c3: x2 - 0.5 x4 = 0
Bounds
0 <= x1 <= 40
2 <= x4 <= 3
End`

const PROBLEM2 = "Maximize \n obj: \n Aa \n Subject To \n c1: Aa <= 10 \n End" 

async function test() {
    const highs = await highs_promise;
    const sol = highs.solve(PROBLEM2);
    console.log(sol)
}

async function solveLP(lp) {
    const highs = await highs_promise;
    const sol = highs.solve(lp)
    console.log(sol)
    return sol
}

module.exports = {test, solveLP}
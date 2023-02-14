const util = require("./util")
const ds = require("./ds")
const lp_solver = require("./lp_solver")
const ds3lp = require("./ds3lp")

//ds.genDSseq(3,3)
// lp_solver.test()
// lp_solver.solveLP("Maximize \n obj: \n x1 \n Subject To \n c1: x1 >= 10 \n c2: x1 >= 11 \n End")
const test1 = "ABACACBC" //longest DS(3,3)
const test2 = "ABCBADADBDCD" //longest DS(4,3)

result = ds3lp.sequenceToLineSegmentLP(test1)
lp_solver.solveLP(result)
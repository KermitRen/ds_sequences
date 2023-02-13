const util = require("./util")
const ds = require("./ds")
const lp_solver = require("./lp_solver")


//ds.genDSseq(3,3)
lp_solver.solveLP("Maximize \n obj: \n x1 \n Subject To \n c1: x1 >= 10 \n c2: x1 >= 11 \n End")
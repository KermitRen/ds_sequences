const util = require("./util")

class lineSegment_lp {
    constructor() { 
        this.constraints = []
        this.bounds = [] 
    }
    addConstraint(c) { this.constraints.push(c) }
    addBound(b) {this.bounds.push(b)}
    getProgram() {
        var str = "Maximize \n Obj: \n  0 \n"
        if(this.constraints.length > 0) {
            str += "Subject To \n"
            var constraintCounter = 1
            for(var i = 0; i < this.constraints.length; i++) {
                str += " C" + constraintCounter + ": " + this.constraints[i] + " \n"
                constraintCounter++
            }  
        }
        if(this.bounds.length > 0) {
            str += "Bounds \n"
            for(var i = 0; i < this.bounds.length; i++) {
                str += " " + this.bounds[i] + " \n"
            }
        }
        str += "End"
        return str
    }
}

function toLineSegmentLP(sequence) {
    const epsilon = -0.0001
    var lp = new lineSegment_lp()
    var symbols = util.getUniqueSymbols(sequence)
    var map = util.getOccurenceMap(sequence, symbols)

    //Add Beginning Constraints
    for (var i = 1; i < symbols.length; i++) {
        const currSymbol = symbols[i]
        const prevSymbol = sequence[map.get(currSymbol).first - 1]
        const x = map.get(currSymbol).first + 1
        var constraint = x + " " + currSymbol + "a + " + currSymbol + "b "
        constraint += "- " + x + " " + prevSymbol + "a - " + prevSymbol + "b <= " + epsilon
        lp.addConstraint(constraint)
    }

    //Add Fixed Intersection Constraints
    var intersections = util.getAllPairs(symbols)
    for (var i = 2; i < sequence.length - 1; i++) {
        const currSymbol = sequence[i]
        const prevSymbol = sequence[i - 1]
        if (map.get(currSymbol).first != i && map.get(prevSymbol).last != i - 1) {
            const x = i + 1
            var constraint = x + " " + currSymbol + "a + " + currSymbol + "b "
            constraint += "- " + x + " " + prevSymbol + "a - " + prevSymbol + "b = 0"
            lp.addConstraint(constraint)
            intersections = intersections.filter(pair => pair != util.sortString(currSymbol + prevSymbol))
        }
    }

    //Add Flexible Intersection Constraints
    for(var i = 0; i < intersections.length; i++) {
        const symbol1 = intersections[i][0]
        const symbol2 = intersections[i][1]
        const constraintNecessary = map.get(symbol2).first < map.get(symbol1).last
        if(constraintNecessary) {
            var x = 0
            for(var j = 0; i < sequence.length; j++) {
                if(sequence[j] == symbol1 && x > 0) {
                    break
                } else if(sequence[j] == symbol2) {
                    x = j + 2
                }
            }
            var constraint = x + " " + symbol2 + "a + " + symbol2 + "b "
            constraint += "- " + x + " " + symbol1 + "a - " + symbol1 + "b <= 0"
            lp.addConstraint(constraint)
        }
    }

    //Add Bounds
    for(var i = 0; i < symbols.length; i++) {
        lp.addBound("-infinity <= " + symbols[i] + "a <= infinity")
        lp.addBound("-infinity <= " + symbols[i] + "b <= infinity")
    }

    return lp.getProgram()
}

module.exports = {toLineSegmentLP}
const util = require("./util")
const fs = require("fs")

const data = JSON.parse(fs.readFileSync("construction_data.json"))
const CTable = data.C
const seqTable = data.seqs

function C(k, m) {

    //Table lookup
    const lookupString = "" + k + "," + m
    if (CTable.hasOwnProperty(lookupString)) {
        return CTable[lookupString]
    }

    //Compute new value
    var result
    if (k == 1) {
        result = 1
    } else if (m == 1) {
        result = 2*C(k-1, 2)
    } else if(k == 2) {
        result = 2
    } else {
        var mu = C(k, m-1)
        result = mu*C(k-1, mu)
    }

    //Save value in table
    CTable[lookupString] = result
    saveData()
    return result
}

function saveData() {
    const rawData = JSON.stringify(data, null, 2)
    fs.writeFileSync("construction_data.json", rawData, (err) => {
        if (err) throw err;
    })
}

function constructSequence(k, m) {

    //Table lookup
    const lookupString = "" + k + "," + m
    if (seqTable.hasOwnProperty(lookupString)) {
        return JSON.parse(JSON.stringify(seqTable[lookupString]))
    }

    var seq = []

    // Case 1
    if (k == 1) {
        for (var i = 0; i < m; i++) {
            seq.push({index: i+1, fan: 1})
        }
        seqTable[lookupString] = JSON.parse(JSON.stringify(seq))
        saveData()
        return seq
    }

    // Case 2
    if (k == 2) {
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < m; j++) {
                seq.push({index: j+1, fan: i+1})
            }
            for (var j = m-1; j > 0; j--) {
                seq.push({index: j, fan: i+1})
            }
        }
        seqTable[lookupString] = JSON.parse(JSON.stringify(seq))
        saveData()
        return seq
    }

    // Case 3
    if (m == 1) {
        var baseSeq = constructSequence(k-1, 2)
        seq = baseSeq.map(e => { 
            return {index: 1, fan: e.index + (e.fan-1)*2}
        })
        seqTable[lookupString] = JSON.parse(JSON.stringify(seq))
        saveData()
        return seq
    }

    // Case 4
    const mu = C(k, m-1)
    const nu = C(k-1, mu)

    //Step 1
    var SPrime = constructSequence(k, m-1)

    //Step 2
    var SPrimes = []
    for (var j = 0; j < nu; j++) {
        var SPrimeCopy = JSON.parse(JSON.stringify(SPrime))
        for (var i = 0; i < SPrime.length; i++) {
            SPrimeCopy[i].copy = j + 1
        }
        SPrimes.push(SPrimeCopy)
    }

    //Step 3
    var SStar = constructSequence(k-1, mu)
    var currentFan = null
    var currentFanIndex = 1
    for (var i = 0; i < SStar.length; i++) {
        SStar[i].star = m
        if (SStar[i].fan == currentFan) {
            if (SStar[i].index == currentFanIndex+1) {
                currentFanIndex++
                if (currentFanIndex == mu) {
                    var symbolCopy = JSON.parse(JSON.stringify(SStar[i]))
                    SStar.splice(i, 0, symbolCopy)
                }
            } else {
                currentFan = null
            }
        } else {
            if (SStar[i].index == 1) {
                currentFan = SStar[i].fan
                currentFanIndex = 1
            } else {
                currentFan = null
            }
        }
    }
    
    // Step 4
    for (var j = 0; j < nu; j++) {
        SPrime = SPrimes[j]
        for (var i = 0; i < mu; i++) {
            var index = SPrime.findIndex(e => e.fan == i+1 && e.index == (m-1))
            var copy = JSON.parse(JSON.stringify(SPrime[index]))
            var copy2 = JSON.parse(JSON.stringify(copy))
            copy2.index = copy2.index + 1
            SPrime.splice(index+1, 0, copy2)
            SPrime.splice(index+2, 0, copy)
        }
    }

    // Step 5
    for (var j = 0; j < nu; j++) {
        SPrime = SPrimes[j]
        var fanStart = SStar.findIndex(e => e.fan == j+1 && e.index == (1) && e.hasOwnProperty("star"))
        SStar.splice(fanStart, mu, ...SPrime)
    }

    // Reformat sequence
    SStar = SStar.map(e => {
        if (e.hasOwnProperty("star")) {
            e.copy = e.fan
            e.fan = e.index
            e.index = e.star
        }
        return {index: e.index, fan: e.fan + (e.copy-1)*mu}
    })

    seqTable[lookupString] = JSON.parse(JSON.stringify(SStar))
    saveData()
    return SStar
}

function symbolizeSequence(seq, log = false) {
    var result = ""
    var numberOfSymbols = 0
    var symbolMap = new Map()
    for (var i = 0; i < seq.length; i++) {
        var symbolObject = "" + seq[i].index + seq[i].fan
        if (symbolMap.has(symbolObject)) {
            result += symbolMap.get(symbolObject)
        } else {
            symbolMap.set(symbolObject, getSymbol(numberOfSymbols))
            numberOfSymbols++
            result += symbolMap.get(symbolObject)
        }
    }

    if (log) {
        util.logPositive("Sequence has length: " + seq.length)
        util.logPositive("And consists of " + numberOfSymbols + " unique symbols")
    }
    return result
}

function getSymbol(s) {
    /*
    var result = util.symbols[s % 26]
    if(s >= 26) {
        for (var i = 0; i < Math.floor(s/26); i++) {
            result += "+"
        }
    }
    return result*/

    var test = ["A","的", "一", "是", "不", "了", "在", "人", "有", "我", "他", "这", "个", "上", "们", "来", "到", "时", "大", "地", "为", "子", "中", "你", "说", "生", "国", "年", "着", "就", "那", "和", "要", "她", "出", "也", "得", "里", "后", "自", "以", "会", "家", "可", "下", "而", "过", "天", "去", "能", "对", "小", "多", "然", "于", "心", "学", "么", "之", "都", "好", "看", "起", "发", "当", "没", "成", "只", "如", "事", "把", "还", "用", "第", "样", "道", "想", "作", "种", "开", "美", "总", "从", "无", "情", "己", "面", "最", "女", "但", "现", "前", "些", "所", "同", "日", "手", "又", "行", "意", "动", "方", "期", "它", "头", "经", "长", "儿", "回", "位", "分", "爱", "老", "因", "很", "给", "名", "法", "间", "斯", "知", "世", "什", "两", "次", "使", "身", "者", "被", "高", "已", "亲", "其", "进", "此", "话", "常", "与", "活", "正", "感", "见", "明", "问", "力", "理", "尔", "点", "文", "几", "定", "本", "公", "特", "做", "外", "孩", "相", "西", "果", "走", "将", "月", "十", "实", "向", "声", "车", "全", "信", "重", "三", "机", "工", "物", "气", "每", "并", "别", "真", "打", "太", "新", "比", "才", "便", "夫", "再", "书", "部", "水", "像", "眼", "等", "体", "却", "加", "电", "主", "界", "门", "利", "海", "受", "听", "表", "德", "少", "克", "代", "员", "许", "稳", "步", "半", "乎", "城", "细", "即", "改", "楼", "般", "照", "嘴", "越", "河", "叫", "令", "轮", "价", "份", "父"]
    return test[s]
}

module.exports = {constructSequence, symbolizeSequence, C}
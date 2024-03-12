class PromParser {
    constructor(str) {
        this.str = str
        this.metrics = {}
    }

    load() {
        let _this = this
        let rows = this.str.split(/(?:\r\n|\r|\n)/g)
        rows.forEach(function(row) {
            let results =/^\s*(\w+){.*}\s([\.\d]+)$/g.exec(row)
            if (results && results.length == 3) {
                _this.metrics[results[1]] = results[2]
            } else {
                let results2 = /^\s*(\w+)\s([\.\d]+)$/g.exec(row)
                if (results2 && results2.length == 3) {
                    _this.metrics[results2[1]] = results2[2]
                }
            }
        })
    }

    Check(metricName, expectValue) {
        return this.metrics[metricName] == expectValue
    }

    static Create(str) {
        let p = new PromParser(str)

        p.load()

        return p
    }
}

module.exports = PromParser
const assert = require('assert');

class ReqParser {
    constructor(data) {
        this.request = data;
        this.cursor = 0;
    }

    parse() {
        let start = this.cursor;
        this.args = [];
        try {
            assert.equal(this.curr(), '*', 'Req should be started with *');
            this.cursor++;
            this.numOfArgs = this.readNum();

            for(let i=0; i<this.numOfArgs; i++) {
                this.args.push(this.readBulkString());
            }
        } catch (error) {
            this.cursor = start;
            this.args = [];
        }
        finally {
            return this.args;
        }
    }

    readNum() {
        let num = 0;
        while (this.curr() !== "\r") {
            num = num * 10 + (this.curr() - "0"); // i/p is in string
            this.cursor++;
        }

        this.cursor += 2; // to skip \r\n
        return num;
    }

    readBulkString() {
        assert.equal(this.curr(), '$', 'BulkString should start with $');
        this.cursor++;
        let lenOfStr = this.readNum();
        let str = this.getString(lenOfStr);
        return str;
    }

    getString(lenOfStr) {
        let str = this.request.slice(this.cursor, this.cursor + lenOfStr);
        this.cursor += lenOfStr + 2;
        return str;
    }

    curr() {
        return this.request[this.cursor];
    }
}

module.exports = ReqParser;

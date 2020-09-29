"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.APKG = void 0;
var Database = require("better-sqlite3");
var path_1 = require("path");
var sql_1 = require("./sql");
var fs_1 = require("fs");
var rimraf = require("rimraf");
var archiver = require("archiver");
var APKG = /** @class */ (function () {
    function APKG(config) {
        this.config = config;
        this.dest = path_1.join(__dirname, config.name);
        this.clean();
        fs_1.mkdirSync(this.dest);
        this.db = new Database(path_1.join(this.dest, 'collection.anki2'));
        this.deck = __assign(__assign({}, config), { id: +new Date() });
        sql_1.initDatabase(this.db, this.deck);
        this.mediaFiles = [];
    }
    APKG.prototype.addCard = function (card) {
        sql_1.insertCard(this.db, this.deck, card);
    };
    APKG.prototype.addMedia = function (filename, data) {
        var index = this.mediaFiles.length;
        this.mediaFiles.push(filename);
        fs_1.writeFileSync(path_1.join(this.dest, "" + index), data);
    };
    APKG.prototype.save = function (destination) {
        var directory = path_1.join(__dirname, this.config.name);
        var archive = archiver('zip');
        var mediaObj = this.mediaFiles.reduce(function (obj, file, idx) {
            obj[idx] = file;
            return obj;
        }, {});
        fs_1.writeFileSync(path_1.join(this.dest, 'media'), JSON.stringify(mediaObj));
        archive.directory(directory, false);
        archive.pipe(fs_1.createWriteStream(path_1.join(destination, this.config.name + ".apkg")));
        archive.finalize();
        archive.on('end', this.clean.bind(this));
    };
    APKG.prototype.clean = function () {
        rimraf(this.dest, function () { });
    };
    return APKG;
}());
exports.APKG = APKG;

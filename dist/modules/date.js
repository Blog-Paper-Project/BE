"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function calcOneWeek() {
    const now = new Date();
    const day = now.getDate();
    return new Date(new Date().setDate(day - 7));
}
exports.default = calcOneWeek;

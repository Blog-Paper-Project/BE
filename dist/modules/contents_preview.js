"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function deleteImgUrl(paper) {
    const contents = paper.contents
        .replace(/!\[(.){0,50}\]\(https:\/\/hanghae-mini-project.s3.ap-northeast-2.amazonaws.com\/[0-9]{13}.[a-z]{3,4}\)/g, '')
        .slice(0, 120);
    return Object.assign(paper, { contents });
}
exports.default = deleteImgUrl;

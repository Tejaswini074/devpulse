const { v4: uuid } = require("uuid");

exports.generateEmployeeCode = () => {

    return "EMP-" +
        uuid()
            .substring(0, 8)
            .toUpperCase();

};

exports.generateOrganizationCode = () => {

    return "ORG-" +
        uuid()
            .substring(0, 8)
            .toUpperCase();

};

exports.generateProjectCode = () => {

    return "PRJ-" +
        uuid()
            .substring(0, 8)
            .toUpperCase();

};

exports.generateTaskCode = () => {

    return "TSK-" +
        uuid()
            .substring(0, 8)
            .toUpperCase();

};

exports.generateLogCode = () => {

    return "LOG-" +
        uuid()
            .substring(0, 8)
            .toUpperCase();

};
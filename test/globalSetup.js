const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const jsdomGlobal = require("jsdom-global");
jsdomGlobal();

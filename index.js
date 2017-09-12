'use strict';

const ExtendableStub = require('./src/ExtendableStub');
const SAPDefine = require('./src/sapDefine');

module.exports = {

	createExtendable: function(mockMethods) {
		return new ExtendableStub(mockMethods);
	},

	importUI5ModuleFactory : SAPDefine.importFactory,

  importUI5Module : function(module_path, dependencies, globalContext) {
    let importObject = SAPDefine.importFactory(module_path, globalContext);
		return importObject.apply(this, dependencies);
	}
};

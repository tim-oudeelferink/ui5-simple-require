"use strict";

const ExtendableStub = require("./src/ExtendableStub");
const SAPDefine = require("./src/sapDefine");
const RequiredClass = require("./src/RequiredClass");
const deepmerge = require('deepmerge');

let deprecated_flag = false;

let dependency_lookup = {};
let global_context = {}

module.exports = {

  loaded_factories: {},

  createExtendableFromPrototype: function (proto) {
    try {
      //eslint-disable-next-line no-unused-vars
      let instance = proto();
    } catch (e) {
      if (e instanceof TypeError) {
        throw new Error("Illegal argument: only ES5 prototype accepted");
      }
      throw e;
    }
    proto.extend = ExtendableStub.extend;
    return proto;
  },

  createExtendableFromObj: function (proto) {
    return this.getExtendableStub(proto);
  },

  getExtendableStub: function(name, obj) {
    if (typeof name === "object" && !obj) {
      obj = name;
      name = null;
    }
    return ExtendableStub.extend(name || "", obj || {});
  },

  globalContext: function(context) {
    global_context = deepmerge(global_context, context); 
  },

  clearGlobalContext: function() {
    global_context = {};
  },

  inject: function(path, dep) {
    dependency_lookup[path] = dep;
  },

  clearInjection: function() {
    dependency_lookup = {};
  },

  ui5require: function(module_path, position_dependencies, context) {
    const requiredClass = new RequiredClass(module_path);
    global_context = deepmerge(global_context, context || {});
    return requiredClass.resolve(
      global_context, 
      dependency_lookup, 
      position_dependencies || []);
  },

  import: function(module_path, dependencies, globalContext) {
    if (!deprecated_flag) {
      console.log('\x1b[31m', '@ui5-module-loader: `.import` method is deprecated. Use `.ui5require` instead.');
      deprecated_flag = true;
    }
    let importedObject;

    dependencies = dependencies || [];
    globalContext = globalContext || {};

    if (this.loaded_factories[module_path]) {
      const loaded = this.loaded_factories[module_path];
      global.sap = loaded.sap;
      importedObject = loaded.fn;
    } else {
      importedObject = SAPDefine.importFactory(module_path, globalContext);
      this.loaded_factories[module_path] = {
        fn: importedObject,
        sap: global.sap
      };
    }

    return importedObject.apply(this, dependencies);
  }
};

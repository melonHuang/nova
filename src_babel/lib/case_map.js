'use strict';
define(function() {

    let CaseMap = {

        _caseMap: {},

        dashToCamelCase: function(dash) {
          var mapped = this._caseMap[dash];
          if (mapped) {
            return mapped;
          }
          // TODO(sjmiles): is rejection test actually helping perf?
          if (dash.indexOf('-') < 0) {
            return this._caseMap[dash] = dash;
          }
          return this._caseMap[dash] = dash.replace(/-([a-z])/g, 
            function(m) {
              return m[1].toUpperCase(); 
            }
          );
        },

        camelToDashCase: function(camel) {
          var mapped = this._caseMap[camel];
          if (mapped) {
            return mapped;
          }
          return this._caseMap[camel] = camel.replace(/([a-z][A-Z])/g, 
            function (g) { 
              return g[0] + '-' + g[1].toLowerCase() 
            }
          );
        }

    }

    return CaseMap;
});

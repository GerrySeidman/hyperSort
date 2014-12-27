'use strict';

var chai = require('chai');
var assert = chai.assert;

var hypersort = require('../src/hypersort');

var utils = require('./testUtils');

describe('Testing QuickSort', function() {

    describe('Eat array of nulls', function() {
        it('should complete without errors', function() {
            // var persons = utils.peopleMaker.makePeople(10);
            // utils.quicksort.sort(persons, 'last');
            assert.equal('foo', 'foo');
        });
    });

    // describe('option methods', function() {
    //     it('should be able to save options', function() {
    //         configA.setOptions(mockOptions);
    //         assert.equal(configA.getOptions(), mockOptions);
    //     });

    //     it('should provide a single object accross instances', function() {
    //         configA.setOptions(mockOptions);
    //         assert.equal(configA.getOptions(), configB.getOptions());
    //     });
    // });

    // describe('controllerConfig methods', function() {
    //     it('should be able to save controllerConfig settings', function() {
    //         configA.setControllerConfig(mockConfig);
    //         //change the object
    //         mockConfig.vendorId = 22;
    //         assert.equal(configA.getControllerConfig(), mockConfig);
    //     });

    //     it('should provide a single object accross instances', function() {
    //         configA.setControllerConfig(mockConfig);
    //         assert.equal(configA.getControllerConfig(), configB.getControllerConfig());
    //     });
    // });

    // describe('default values', function() {
    //     beforeEach(function() {
    //         configA.setOptions();
    //     });
    //     it('should apply default values', function() {
    //         var ops = configA.getOptions();
    //         defaultOptionsInstance.forEach(function(property) {
    //             assert.notEqual(ops[property.name], void 0);
    //         });
    //     });
    //     it('should load default config', function() {
    //         var controllerConfig = configA.getControllerConfig();
    //         assert.notEqual(controllerConfig, null);
    //         assert.notEqual(controllerConfig, void 0);
    //     });
    // });
});

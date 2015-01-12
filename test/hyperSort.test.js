'use strict';

var assert = require("assert");


var hypersort = require('../src/hypersort').hypersort;
var gsUtils = require('./gsUtils').gsUtils; // FixMe: Not sure why the .peopleMaker is needed
var peopleMaker = require('./testUtils').peopleMaker; // FixMe: Not sure why the .peopleMaker is needed

describe('Testing Sorts', function() {

    var makeDataSets = function(n) {

        console.log('Making Datasets, n= ' + n);

        var timer = gsUtils.newTimer();

        var dataSets = [{
            name: 'Random set of small set of values (8)',
            // midwayPrint: timer.log('   Making DataSet: MV'),
            data: peopleMaker.makePeople(n),
            // finalPrint: timer.log('   Finished DataSet: MV'),
        }, {
            name: 'Two Values all larger then smaller',
            // midwayPrint: timer.log('   Making DataSet: 2V'),
            data: peopleMaker.makeTwoValuedPeople(n),
            // finalPrint: timer.log('   Finished DataSet: 2V'),
        }, {
            name: 'All Values Distinct and random',
            // midwayPrint: timer.log('   Making DataSet: Random'),
            data: peopleMaker.makeDistinctValuedPeople(n),
            // finalPrint: timer.log('   Finished DataSet: Random'),
        }];

        return dataSets;
    };

    var sortTypes = hypersort.getSortTypes();

    var copy = function(from, to) {
        if (from.length != to.length) {
            to = new Array(from.length);
        }

        for (var i = 0; i < from.length; i++) {
            to[i] = from[i];
        }

        return to;
    };

    var workingData = []; // Used to store a copy of the unsorted dataset for testing.

    var dump = function(data) {
        console.log('-------------------');
        for (var i = 0; i < data.length; i++) {
            console.log(i + ': ' + data[i]);
        }
    };

    var tlog = function(message) {
        console.log('\t' + message);
    };

    var performTest = function(sort, dataSet, colName) {

        it(dataSet.name, function() {
            workingData = copy(dataSet.data, workingData);

            // assert.equals(peopleMaker.validate(data, colName, sort.isStable), true);
            // assert.equals('foo', 'foo');
            var timer = gsUtils.newTimer();
            sort.sortFunction(workingData, colName);

            var valid = peopleMaker.validate(workingData, colName, sort.isStable);
            // var resultMessage = timer.getDuration() + ' ms spent ' + message;

            // console.log('sorted');
            // for (i = 0; i < data.length; i++) {
            //     console.log(i + ': ' + data[i]);
            // }

            tlog((valid ? 'PASS ' : 'FAIL ') + timer.getDuration() + ' ms spent completing the following:');
            assert.equal(valid, true);
        });
    };


    var testSortOnAllDataSets = function(sort, dataSets, colName) {

        var title = sort.name + ': Expecting result to ' + (sort.isStable ? '' : 'NOT') + ' be stable';

        describe(title, function() {
            for (var i = 0; i < dataSets.length; i++) {
                performTest(sort, dataSets[i], colName);
            }
        });
    };

    var testSuite = function(sortTypes, dataSets, colName, subtype) {

        if (subtype === 'absoluteValue') {
            describe('Absolute Value Test', function() {
                it('NOT IMPLEMENTED', function() {

                });
            });
            return;
        }

        describe('Run full Test Suite on col = "' + colName + '", n = ' + n, function() {

            // var dataSets = makeDataSets(n);

            for (var i = 0; i < sortTypes.length; i++) {
                var sort = sortTypes[i];

                testSortOnAllDataSets(sort, dataSets, colName);
            }
        });
    };

    var n = 100;
    var dataSets = makeDataSets(n);


    testSuite(sortTypes, dataSets, 'textValue');
    testSuite(sortTypes, dataSets, 'numericValue');
    testSuite(sortTypes, dataSets, 'dateValue');
    testSuite(sortTypes, dataSets, 'numericValue', 'absoluteValue');

});

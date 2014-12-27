/* globals module */

'use strict';

(function(exports) {

    var randomSeed = 1;

    var createTimer = function() {
        var getTime = function() {
            var result = (new Date().getTime());
            return result;
        };

        if (arguments.length !== 0) {
            console.log(arguments[0]);
        }


        var startTime = getTime();
        var prevTime = startTime;

        return {
            restart: function() {
                startTime = Date();
            },
            getDuration: function() {
                return getTime() - startTime;
            },
            log: function() {
                var now = getTime();
                var duration = now - startTime;
                var diff = now - prevTime;
                var message = (arguments.length === 0) ? "Duration" : arguments[0];
                console.log(message + ': ' + duration + ((startTime != prevTime) ? (' (diff: ' + diff + ')') : ''));
                prevTime = now;
            }
        };

    };

    exports.gsUtils = {

        random: function() {
            var x = Math.sin(randomSeed++) * 10000;
            var result = x - Math.floor(x);
            return result;
        },

        setRandomSeed: function(seed) {
            var oldSeed = randomSeed;
            randomSeed = seed;
            return oldSeed;
        },

        newTimer: createTimer

    };

})(typeof exports !== 'undefined' && exports || this); // jshint ignore:line

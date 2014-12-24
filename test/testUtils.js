/* globals module */

'use strict';

var functs = {};

var randomSeed = 1;

functs.random = function() {

    var x = Math.sin(randomSeed++) * 10000;
    var result = x - Math.floor(x);
    return result;
};

functs.setRandomSeed = function(seed) {
    var oldSeed = randomSeed;
    randomSeed = seed;
    return oldSeed;
};

module.exports.functs = functs;

var gf = functs;


var firstNames = ['Olivia', 'Sophia', 'Ava', 'Isabella', 'Boy', 'Liam', 'Noah', 'Ethan', 'Mason', 'Logan', 'Moe', 'Larry', 'Curly', 'Shemp', 'Groucho', 'Harpo', 'Chico', 'Zeppo', 'Stanley', 'Hardy'];
var lastNames = ['Wirts', 'Oneil', 'Smith'];
// var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
// var days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];
// var states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

var nextPeopleNum = 1000;

var randomPerson = function() {
    var firstName = Math.round((firstNames.length - 1) * gf.random());
    var lastName = Math.round((lastNames.length - 1) * gf.random());
    // var pets = Math.round(10 * gf.random());
    // var birthyear = 1900 + Math.round(gf.random() * 114);
    // var birthmonth = Math.round(gf.random() * 11);
    // var birthday = Math.round(gf.random() * 29);
    // var birthstate = Math.round(gf.random() * 49);
    // var residencestate = Math.round(gf.random() * 49);
    // var travel = gf.random() * 1000;
    // var income = gf.random() * 100000;
    // var employed = Math.round(gf.random());
    var person = {
        last: lastNames[lastName],
        first: firstNames[firstName],
        uid: nextPeopleNum++,
        pow: 10,
        skunk: function() {
            return this.uid + ': ' + this.last + ' ' + this.first;
        },
        /*
                pets: pets,
                birthdate: birthyear + '-' + months[birthmonth] + '-' + days[birthday],
                birthstate: states[birthstate],
                residencestate: states[residencestate],
                employed: employed === 1,
                income: income,
                travel: travel
        */

        toString: function() {
            return this.uid + ': ' + this.last + ' ' + this.first;
        },

    };

    return person;
};

module.exports.peopleMaker = {
    makePerson: function() {
        return randomPerson();
    },
    makePeople: function(numPeople) {
        var result = [];

        for (var i = 0; i < numPeople; i++) {
            result.push(randomPerson());
        }

        return result;
    }

};

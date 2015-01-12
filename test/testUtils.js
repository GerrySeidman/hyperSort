/* globals module */

'use strict';

(function(exports) {

    var firstNames = ['Olivia', 'Sophia', 'Ava', 'Isabella', 'Boy', 'Liam', 'Noah', 'Ethan', 'Mason', 'Logan', 'Moe', 'Larry', 'Curly', 'Shemp', 'Groucho', 'Harpo', 'Chico', 'Zeppo', 'Stanley', 'Hardy'];
    var lastNames = ['Wirts', 'Oneil', 'Smith', 'Abbot', 'Costello', 'Laurel', 'Clinton', 'Obama'];
    var dates = new Array(lastNames.length);

    var date1 = new Date(2014, 11, 15); // Dec 15, 2014
    var date2 = new Date(2015, 0, 23); // Jan 23, 2015
    var date3 = new Date(2016, 11, 15); // Dec 15, 2016

    dates[0] = date1;

    for (var i = 1; i < dates.length; i++) {
        dates[i] = new Date(dates[i - 1]);
        dates[i].setDate(dates[i].getDate() + 1);
    }

    // var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    // var days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];
    // var states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

    var nextPeopleNum = 1000;

    var gf = exports.gsUtils || require('./gsUtils').gsUtils; // FIXME: Figure out why I needed this

    var randomPerson = function() {
        var firstName = Math.round((firstNames.length - 1) * gf.random());
        var lastName = Math.round((lastNames.length - 1) * gf.random());
        var dateIndex = Math.round((dates.length - 1) * gf.random());
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
            // first: firstNames[firstName],
            uid: nextPeopleNum++,
            textValue: lastNames[lastName],
            numericValue: lastName + 0.001,
            dateValue: dates[dateIndex],
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
                return this.uid + ': ' + this.textValue + '\t' + this.numericValue + '\t' + this.dateValue + ' _i:' + this.__i;
            },

        };

        return person;
    };

    exports.peopleMaker = {

        makePerson: function() {
            return randomPerson();
        },
        makePeople: function(numPeople, seed) {
            // console.log('Making Regular: ' + numPeople);
            var result = new Array(numPeople);

            seed = seed || 1;
            gf.setRandomSeed(seed);

            for (var i = 0; i < numPeople; i++) {
                result[i] = randomPerson();
            }

            return result;
        },
        makeTwoValuedPeople: function(numPeople, seed) {
            // console.log('Making Two Value: ' + numPeople);
            var persons = exports.peopleMaker.makePeople(numPeople, seed);
            var half = persons.length / 2;

            for (var i = 0; i < persons.length; i++) {
                if (i < half) {
                    persons[i].last = 'Wirts';
                    persons[i].textValue = 'Wirts';
                    persons[i].numericValue = 2.0;
                    persons[i].dateValue = date2;
                } else {
                    persons[i].last = 'Seidman';
                    persons[i].textValue = 'Seidman';
                    persons[i].numericValue = 1.0;
                    persons[i].dateValue = date1;
                }
            }
            return persons;
        },
        makeDistinctValuedPeople: function(numPeople, seed) {
            // console.log('Making Distinct: ' + numPeople);
            var persons = exports.peopleMaker.makePeople(numPeople, seed);
            var d0 = date1.valueOf();
            var diff = date3.valueOf() - date1.valueOf();

            for (var i = 0; i < persons.length; i++) {
                var rand = gf.random();
                persons[i].last = 'a' + rand + 'b';
                persons[i].textValue = persons[i].last;
                persons[i].numericValue = rand;

                persons[i].dateValue = new Date(d0 + rand * diff); // random date between date1 and date3
            }

            return persons;
        },

        dump: function(title, persons, validate) {
            console.log(title + ": " + persons.length);
            for (var i = 0; i < persons.length; i++) {
                console.log('[' + i + '] ' + persons[i].toString());

                // if (validate && (i !== 0)) {
                //     if (persons[i - 1].last < persons[i].last) {
                //         continue;
                //     } else if (persons[i - 1].last === persons[i].last) {
                //         if (persons[i - 1].__i < persons[i].__i) {
                //             continue;
                //         }
                //     }

                //     console.log("OUT OF ORDER, ABORT DUMP");
                //     return;
                // }
            }
        },

        validate: function(persons, colName, stableRequired, printStatusMessages) {
            var i, prevPerson, person;
            var valid = true;
            var maxToPrint = 20;
            var printed = 0;
            // var printing = false;

            stableRequired = (stableRequired !== undefined) ? stableRequired : false;
            printStatusMessages = (printStatusMessages !== undefined) ? printStatusMessages : false;

            if (printStatusMessages) {
                console.log('Validating: ' + persons.length + ' - Stable' + (stableRequired ? '' : ' Not') + ' Required');
            }

            for (i = 0; i < persons.length; i++) {
                person = persons[i];

                // console.log(i + '.__i: ' + person.__i + '   ' + person[colName]);

                if (i !== 0) {
                    if (person[colName] < prevPerson[colName]) {
                        valid = false;
                        break;
                    } else if (person[colName] > prevPerson[colName]) {
                        if (printStatusMessages && (printed < maxToPrint)) { // Limit output so not to innundate the console
                            console.log(i + ': ' + prevPerson); // dump prev count
                            printed++;
                        }
                        prevPerson = person;
                    } else if (stableRequired) { // equal
                        if (person.__i < prevPerson.__i) {
                            valid = false;
                            break;
                        }
                    }

                }

                prevPerson = person;
            }

            if (printStatusMessages) {
                if (!valid) {
                    console.log('Failed - Person out of order at: ' + i);
                    console.log(prevPerson.__i + ": " + prevPerson);
                    console.log(person.__i + ": " + person);
                } else {
                    console.log(i + ': ' + person); // dump prev count
                    console.log('Valid');
                }
            }

            return valid;
        },

    };
})(typeof exports !== 'undefined' && exports || this); // jshint ignore:line

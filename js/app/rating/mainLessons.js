// This file contains all available german lessons, including their teachers
(function () {
    var MATH = {
        m1T: {
            teacher: "Herr Markert",
            id: "m1T"
        },
        m2T: {
            teacher: "Herr Pabst",
            id: "m2T"
        },
        m12: {
            teacher: "Herr Dr. Keller",
            id: "m12"
        }
    }
        , LESSONS = {
        // Adrian and co.
        d1T: {
            teacher: "Frau Grundner",
            name: "d1T",
            math: [MATH.m1T, MATH.m12]
        },
        d2T: {
            teacher: "Herr Dr. Ruf",
            math: [MATH.m2T, MATH.m12]
        },
        d3: {
            teacher: "Herr Schramm"
        },
        d4: {
            teacher: "Frau Schuhmacher"
        },
        d5: {
            teacher: "Frau Sonneck"
        },
        d6: {
            teacher: "Frau Sieger"
        },
        d7: {
            teacher: "Herr Richter"
        },
        d8: {
            teacher: "Herr Rester"
        },
        d9: {
            teacher: "Herr Megerle"
        }
    }
        , i, curr
    for (i in LESSONS) {
        curr = LESSONS[i]
        LESSONS[i].id = i
        if (!curr.math) {
            LESSONS[i].math = "m" + i.substr(1)
        }
    }

    window.LESSONS = LESSONS
})()
(function() {

    'use strict';

    var RED = '0xFF0000';
    var YELLOW = '0xFFFF00';

    var Cylon = require('cylon');
    var config = require('./config');

    Cylon.api({
        host: '0.0.0.0',
        port: '8080',
        ssl: false
    });

    var sphero = Cylon.robot({
        name: 'sphero',
        connections: {
            sphero: {adaptor: 'sphero', port: config.port}
        },
        devices: {
            sphero: {driver: 'sphero'}
        },
        is_calibrating: false,
        move: function(heading) {
            this.sphero.roll(config.speed, heading);
        },
        left: function() {
            this.move(270);
        },
        right: function() {
            this.move(90);
        },
        fwd: function() {
            this.move(0);
        },
        back: function() {
            this.move(180);
        },
        start_calibration: function() {
            this.sphero.setRGB(RED);
            this.sphero.startCalibration();
            this.is_calibrating = true;
        },
        stop_calibration: function() {
            this.sphero.setRGB(YELLOW);
            this.sphero.finishCalibration();
            this.is_calibrating = false;
        },
        work: function(my) {
            my.sphero.setRGB(YELLOW);
            my.sphero.detectCollisions();
            my.sphero.on('collision', function() {
                my.start_calibration();
            });
        }
    });
    sphero.start();

    var pebble = Cylon.robot({
        name: 'pebble',
        connections: {
            pebble: {adaptor: 'pebble'}
        },
        devices: {
            pebble: {driver: 'pebble'}
        },
        work: function(my) {
            my.pebble.on('button', function(button) {
                if (button === 'up') {
                    sphero.left();
                }
                if (button === 'down') {
                    sphero.right();
                }
                if (button === 'select') {
                    if (sphero.is_calibrating) {
                        sphero.stop_calibration();
                    }
                    else {
                        sphero.fwd();
                    }
                }
            });
            my.pebble.on('tap', function() {
                sphero.back();
            });
        }
    });
    pebble.start();

})();

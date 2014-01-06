var assert = require('assert');
var after = require('after');

var auth = require('./auth');
var Zuul = require('../');
var scout_browser = require('../lib/scout_browser');

test('mocha-qunit - phantom', function(done) {
    done = after(3, done);

    var config = {
        ui: 'mocha-qunit',
        prj_dir: __dirname + '/mocha-qunit',
        phantom: true,
        files: [__dirname + '/mocha-qunit/test.js']
    };

    var zuul = Zuul(config);

    // each browser we test will emit as a browser
    zuul.on('browser', function(browser) {
        browser.on('init', function() {
            done();
        });

        browser.on('done', function(results) {
            assert.equal(results.passed, 1);
            assert.equal(results.failed, 1);
            done();
        });
    });

    zuul.run(function(passed) {
        assert.ok(!passed);
        done();
    });
});

// sanity test single browser before letting the beast loose
test('mocha-qunit - chrome 31', function(done) {

    done = after(3, done);

    var config = {
        ui: 'mocha-qunit',
        prj_dir: __dirname + '/mocha-qunit',
        files: [__dirname + '/mocha-qunit/test.js'],
        username: auth.username,
        key: auth.key
    };

    var zuul = Zuul(config);

    zuul.browser({
        name: 'chrome',
        version: '31',
        platform: 'any'
    });

    // each browser we test will emit as a browser
    zuul.on('browser', function(browser) {
        browser.on('init', function() {
            done();
        });

        browser.on('done', function(results) {
            assert.equal(results.passed, 1);
            assert.equal(results.failed, 1);
            done();
        });
    });

    zuul.run(function(passed) {
        assert.ok(!passed);
        done();
    });
});

test('mocha-qunit - sauce', function(done) {
    var config = {
        ui: 'mocha-qunit',
        prj_dir: __dirname + '/mocha-qunit',
        files: [__dirname + '/mocha-qunit/test.js'],
        username: auth.username,
        key: auth.key
    };

    var zuul = Zuul(config);

    scout_browser(function(err, browsers) {
        assert.ifError(err);

        var total = 0;
        Object.keys(browsers).forEach(function(key) {
            var list = browsers[key];
            list.forEach(function(info) {
                total++;
                zuul.browser(info);
            });
        });

        // twice per browser and once for all done
        done = after(total * 2 + 1, done);

        // each browser we test will emit as a browser
        zuul.on('browser', function(browser) {
            browser.on('init', function() {
                done();
            });

            browser.on('done', function(results) {
                assert.equal(results.passed, 1);
                assert.equal(results.failed, 1);
                done();
            });
        });

        zuul.run(function(passed) {
            assert.ok(!passed);
            done();
        });
    });
});

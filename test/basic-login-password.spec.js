var Code = require('code'),
	Hapi = require('hapi'),
	Lab = require('lab'),
	internals = {},
	lab = exports.lab = Lab.script(),
	describe = lab.describe,
	it = lab.it,
	expect = Code.expect;

describe('Basic authentication with login and password', function () {

	it('validation method should be executed within the scope of request', function (done) {
		var server = new Hapi.Server(),
			request;
		
		server.connection();
		server.register(require('../'), function (err) {
			expect(err).to.not.exist();
			server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: function () {
				var request = this;
				expect(request.raw.req).to.be.an.object();
				expect(request.raw.res).to.be.an.object();
				done();
			} });

			request = { method: 'POST', url: '/', headers: { authorization: internals.header('john', '123:45') } };
			server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: 'default' } });
			server.inject(request);
		});
	});
	
	it('should return a reply on successful auth', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: 'default' } });

	        var request = { method: 'POST', url: '/', headers: { authorization: internals.header('john', '123:45') } };

	        server.inject(request, function (res) {

	            expect(res.result).to.equal('ok');
	            done();
	        });
	    });
	});

	it('should return an error on wrong scheme', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: 'default' } });

	        var request = { method: 'POST', url: '/', headers: { authorization: 'Steve something' } };

	        server.inject(request, function (res) {

	            expect(res.statusCode).to.equal(401);
	            done();
	        });
	    });
	});

	it('should return a reply on successful double auth', function (done) {

	    var handler = function (request, reply) {

	        var options = { method: 'POST', url: '/inner', headers: { authorization: internals.header('john', '123:45') }, credentials: request.auth.credentials };
	        server.inject(options, function (res) {

	            return reply(res.result);
	        });
	    };

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: handler });
	        server.route({ method: 'POST', path: '/inner', handler: function (request, reply) { return reply('ok'); }, config: { auth: 'default' } });

	        var request = { method: 'POST', url: '/', headers: { authorization: internals.header('john', '123:45') } };

	        server.inject(request, function (res) {

	            expect(res.result).to.equal('ok');
	            done();
	        });
	    });
	});

	it('should return a reply on failed optional auth', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: { mode: 'optional' } } });

	        var request = { method: 'POST', url: '/' };

	        server.inject(request, function (res) {

	            expect(res.result).to.equal('ok');
	            done();
	        });
	    });
	});

	it('should return an error on bad password', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: 'default' } });

	        var request = { method: 'POST', url: '/', headers: { authorization: internals.header('john', 'abcd') } };

	        server.inject(request, function (res) {

	            expect(res.statusCode).to.equal(401);
	            done();
	        });
	    });
	});

	it('should return an error on bad header format', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: 'default' } });

	        var request = { method: 'POST', url: '/', headers: { authorization: 'basic' } };

	        server.inject(request, function (res) {

	            expect(res.result).to.exist();
	            expect(res.statusCode).to.equal(400);
	            expect(res.result.isMissing).to.equal(undefined);
	            done();
	        });
	    });
	});

	it('should return an error on bad header internal syntax', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: 'default' } });

	        var request = { method: 'POST', url: '/', headers: { authorization: 'basic 123' } };

	        server.inject(request, function (res) {

	            expect(res.result).to.exist();
	            expect(res.statusCode).to.equal(400);
	            expect(res.result.isMissing).to.equal(undefined);
	            done();
	        });
	    });
	});

	it('should return an error on missing username', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: 'default' } });

	        var request = { method: 'POST', url: '/', headers: { authorization: internals.header('', '') } };

	        server.inject(request, function (res) {

	            expect(res.result).to.exist();
	            expect(res.statusCode).to.equal(401);
	            done();
	        });
	    });
	});

	it('allow missing username', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();

	        server.auth.strategy('default', 'mix-auth', {
	            validateFunc: function (username, password, callback) { callback(null, true, {}); },
	            allowEmptyUsername: true
	        });

	        server.route({ method: 'GET', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: 'default' } });

	        server.inject({ method: 'GET', url: '/', headers: { authorization: internals.header('', 'abcd') } }, function (res) {

	            expect(res.statusCode).to.equal(200);
	            done();
	        });
	    });
	});

	it('should return an error on unknown user', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: 'default' } });

	        var request = { method: 'POST', url: '/', headers: { authorization: internals.header('doe', '123:45') } };

	        server.inject(request, function (res) {

	            expect(res.result).to.exist();
	            expect(res.statusCode).to.equal(401);
	            done();
	        });
	    });
	});

	it('should return an error on internal user lookup error', function (done) {

	    var server = new Hapi.Server({ debug: false });
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: 'default' } });

	        var request = { method: 'POST', url: '/', headers: { authorization: internals.header('jane', '123:45') } };

	        server.inject(request, function (res) {

	            expect(res.result).to.exist();
	            expect(res.statusCode).to.equal(500);
	            done();
	        });
	    });
	});

	it('should return an error on non-object credentials error', function (done) {

	    var server = new Hapi.Server({ debug: false });
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: 'default' } });

	        var request = { method: 'POST', url: '/', headers: { authorization: internals.header('invalid1', '123:45') } };

	        server.inject(request, function (res) {

	            expect(res.result).to.exist();
	            expect(res.statusCode).to.equal(500);
	            done();
	        });
	    });
	});

	it('should return an error on missing credentials error', function (done) {

	    var server = new Hapi.Server({ debug: false });
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: 'default' } });

	        var request = { method: 'POST', url: '/', headers: { authorization: internals.header('invalid2', '123:45') } };

	        server.inject(request, function (res) {

	            expect(res.result).to.exist();
	            expect(res.statusCode).to.equal(500);
	            done();
	        });
	    });
	});

	it('should return an error on insufficient scope', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: { scope: 'x' } } });

	        var request = { method: 'POST', url: '/', headers: { authorization: internals.header('john', '123:45') } };

	        server.inject(request, function (res) {

	            expect(res.result).to.exist();
	            expect(res.statusCode).to.equal(403);
	            done();
	        });
	    });
	});

	it('should return an error on insufficient scope specified as an array', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: { scope: ['x', 'y'] } } });

	        var request = { method: 'POST', url: '/', headers: { authorization: internals.header('john', '123:45') } };

	        server.inject(request, function (res) {

	            expect(res.result).to.exist();
	            expect(res.statusCode).to.equal(403);
	            done();
	        });
	    });
	});

	it('authenticates scope specified as an array', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();
	        server.auth.strategy('default', 'mix-auth', 'required', { validateFunc: internals.user });
	        server.route({ method: 'POST', path: '/', handler: function (request, reply) { return reply('ok'); }, config: { auth: { scope: ['x', 'y', 'a'] } } });

	        var request = { method: 'POST', url: '/', headers: { authorization: internals.header('john', '123:45') } };

	        server.inject(request, function (res) {

	            expect(res.result).to.exist();
	            expect(res.statusCode).to.equal(200);
	            done();
	        });
	    });
	});

	it('should ask for credentials if server has one default strategy', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();

	        server.auth.strategy('default', 'mix-auth', { validateFunc: internals.user });
	        server.route({
	            path: '/',
	            method: 'GET',
	            config: {
	                auth: 'default',
	                handler: function (request, reply) {

	                    return reply('ok');
	                }
	            }
	        });

	        var validOptions = { method: 'GET', url: '/', headers: { authorization: internals.header('john', '123:45') } };
	        server.inject(validOptions, function (res) {

	            expect(res.result).to.exist();
	            expect(res.statusCode).to.equal(200);

	            server.inject('/', function (res) {

	                expect(res.result).to.exist();
	                expect(res.statusCode).to.equal(401);
	                done();
	            });
	        });
	    });
	});

	it('passes non-error err in response', function (done) {

	    var server = new Hapi.Server();
	    server.connection();
	    server.register(require('../'), function (err) {

	        expect(err).to.not.exist();

	        server.auth.strategy('basic', 'mix-auth', true, {
	            validateFunc: function (username, password, callback) {

	                return callback({ some: 'value' }, false, null);
	            }
	        });

	        server.route({ method: 'GET', path: '/', handler: function (request, reply) { return reply('ok'); } })

	        var request = { method: 'GET', url: '/', headers: { authorization: internals.header('john', 'password') } };

	        server.inject(request, function (res) {

	            expect(res.result.some).to.equal('value');
	            expect(res.statusCode).to.equal(200);
	            done();
	        });
	    });
	});
});

internals.header = function (username, password) {

    return 'Basic ' + (new Buffer(username + ':' + password, 'utf8')).toString('base64');
};


internals.user = function (method, authData, callback) {

    if (authData.username === 'john') {
        return callback(null, authData.password === '123:45', {
            user: 'john',
            scope: ['a'],
            tos: '1.0.0'
        });
    }
    else if (authData.username === 'jane') {
        return callback(Hapi.error.internal('boom'));
    }
    else if (authData.username === 'invalid1') {
        return callback(null, true, 'bad');
    }
    else if (authData.username === 'invalid2') {
        return callback(null, true, null);
    }

    return callback(null, false);
};

var express = require('express');
var async = require('async');
var lodash = require('lodash');
var router = express.Router();
var geetest = require('geetest')('2009e939cba634f8da8b32ac7f624f98', '8990504bd745255065b4cb49b5585efc')
var cryptoUtils = require('../lib/crypto.utils');
var config = require('../config');
var userService = require('../service/user.service');
var articleService = require('../service/article.service');
var tagService = require('../service/tag.service');

/* GET home page. */
router.get('/', function (req, res, next) {
    var page = req.query.page || 0;
    async.parallel({
        articles: function (callback) {
            articleService.findPublished({}, page * 10, 10, callback);
        },
        count: function (callback) {
            articleService.count(callback);
        },
        tags: function (callback) {
            articleService.findTags(callback);
        },
        user: function (callback) {
            if (req.session.user)
                userService.findById(req.session.user._id, callback);
            else {
                callback(null, {
                    favorites: null
                });
            }
        }
    }, function (err, results) {
        if (err) {
            next(err);
            return;
        }
        res.render('index', {
            articles: results.articles,
            favorites: results.user ? results.user.favorites : null,
            count: results.count,
            menu: 'index',
            page: (Number(page) + 1),
            tags: results.tags
        });
    });
});

router.get('/search', function (req, res, next) {
    var q = req.query.q || '';
    if (q != '') {
        async.parallel({
            articles: function (callback) {
                articleService.findPublishedAll({
                    $or: [{
                        title: new RegExp(q, 'i')
                    }, {
                        tags: q
                    }]
                }, callback);
            },
            count: function (callback) {
                articleService.count(callback);
            },
            tags: function (callback) {
                articleService.findTags(callback);
            },
            user: function (callback) {
                if (req.session.user)
                    userService.findById(req.session.user._id, callback);
                else {
                    callback(null, {
                        favorites: null
                    });
                }
            }
        }, function (err, results) {
            res.render('search', {
                articles: results.articles,
                favorites: results.user.favorites,
                tag: results.tag,
                menu: 'search',
                key: q,
                tags: results.tags
            });
        });
    } else {
        res.redirect('/');
    }
});

router.get('/hot', function (req, res, next) {
    async.parallel({
        articles: function (callback) {
            articleService.findPublishedAll({
                views: {$gt: 100}
            }, callback);
        },
        tags: function (callback) {
            articleService.findTags(callback);
        },
        user: function (callback) {
            if (req.session.user)
                userService.findById(req.session.user._id, callback);
            else {
                callback(null, {
                    favorites: null
                });
            }
        }
    }, function (err, results) {
        res.render('hot', {
            articles: results.articles,
            favorites: results.user.favorites,
            tags: results.tags,
            menu: 'hot'
        });
    });
});

router.get('/archive', function (req, res, next) {
    articleService.groupByMonth(function (err, data) {
        for (var i = 0; i < data.length; i++) {
            data[i].articles = lodash.orderBy(data[i].articles, ['created_at'], ['desc']);
        }
        res.render('archive', {
            menu: 'archive',
            data: data
        });
    });
});

router.get('/tags/:tag', function (req, res, next) {
    var tag = req.params.tag;
    if (tag.toLowerCase() == 'stackoverflow') {
        res.redirect('/stackoverflow');
        return;
    }
    async.parallel({
        articles: function (callback) {
            articleService.findPublishedAll({
                tags: tag
            }, callback);
        },
        tags: function (callback) {
            articleService.findTags(callback);
        },
        tag: function (callback) {
            tagService.findTag(tag, callback);
        },
        user: function (callback) {
            if (req.session.user)
                userService.findById(req.session.user._id, callback);
            else {
                callback(null, {
                    favorites: null
                });
            }
        }
    }, function (err, results) {
        res.render('tags', {
            articles: results.articles,
            favorites: results.user.favorites,
            tag: results.tag,
            tagName: tag,
            tags: results.tags
        });
    });
});

router.get('/stackoverflow', function (req, res, next) {
    var source = 'StackOverflow';
    async.parallel({
        articles: function (callback) {
            articleService.findPublishedAll({
                source: new RegExp(source, 'i')
            }, callback);
        },
        tags: function (callback) {
            articleService.findTags(callback);
        },
        user: function (callback) {
            if (req.session.user)
                userService.findById(req.session.user._id, callback);
            else {
                callback(null, {
                    favorites: null
                });
            }
        }
    }, function (err, results) {
        res.render('stackoverflow', {
            articles: results.articles,
            favorites: results.user.favorites,
            menu: 'StackOverflow',
            tags: results.tags
        });
    });
});

router.get('/github', function (req, res, next) {
    var source = 'Github';
    async.parallel({
        articles: function (callback) {
            articleService.findPublishedAll({
                source: new RegExp(source, 'i')
            }, callback);
        },
        tags: function (callback) {
            articleService.findTags(callback);
        },
        user: function (callback) {
            if (req.session.user)
                userService.findById(req.session.user._id, callback);
            else {
                callback(null, {
                    favorites: null
                });
            }
        }
    }, function (err, results) {
        res.render('github', {
            articles: results.articles,
            favorites: results.user.favorites,
            source: source,
            menu: 'github',
            tags: results.tags
        });
    });
});
router.get('/source/:source', function (req, res, next) {
    var source = req.params.source;
    async.parallel({
        articles: function (callback) {
            articleService.findPublishedAll({
                source: source
            }, callback);
        },
        tags: function (callback) {
            articleService.findTags(callback);
        },
        user: function (callback) {
            if (req.session.user)
                userService.findById(req.session.user._id, callback);
            else {
                callback(null, {
                    favorites: null
                });
            }
        }
    }, function (err, results) {
        res.render('source', {
            articles: results.articles,
            favorites: results.user.favorites,
            source: source,
            tags: results.tags
        });
    });
});

router.get('/login', function (req, res, next) {
    if (req.session.user) {
        res.redirect('/');
        return;
    }
    geetest.register(function (err, challenge) {
        if (err) {
            next(err);
        }
        if (challenge) {
            res.render('login', {
                challenge: challenge
            });
        } else {
            res.render('login', {});
        }
    });
});


router.post('/login', function (req, res, next) {
    var user = req.body;
    userService.findUserByUsername(user.username, function (err, dbUser) {
        if (err) {
            next(err);
        } else {
            if (dbUser && userService.validatePassword(user.password, dbUser.password)) {
                req.flash(config.constant.flash.success, '欢迎回来, ' + user.username + '!');
                req.session.user = dbUser;
                res.cookie(config.constant.cookie.user, cryptoUtils.encrypt(JSON.stringify(dbUser),
                    config.db.cookieSecret), {
                    maxAge: 1000 * 60 * 60 * 60 * 24 * 7
                });
                res.redirect(req.session.originalUrl ? req.session.originalUrl : '/');
            } else {
                req.flash(config.constant.flash.error, '用户名或密码错误!');
                res.redirect('/login');
            }
        }
    });

});

router.get('/join', function (req, res, next) {
    geetest.register(function (err, challenge) {
        if (err) {
            next(err);
        }
        if (challenge) {
            res.render('join', {
                challenge: challenge
            });
        } else {
            res.render('join', {});
        }
    });
});

router.post('/join', function (req, res, next) {
    var user = req.body;
    if (!user.username || !user.password) {
        req.flash(config.constant.flash.error, '用户名或密码不能为空!');
        res.redirect('/join');
        return;
    }
    if (!user.email) {
        req.flash(config.constant.flash.error, '邮箱不能为空!');
        res.redirect('/join');
        return;
    }
    if (user.password != user.confirm_password) {
        req.flash(config.constant.flash.error, '两次密码输入不一致!');
        res.redirect('/join');
        return;
    }

    async.parallel({
        username: function (callback) {
            userService.findUserByUsername(user.username, callback);
        },
        email: function (callback) {
            userService.findUserByEmail(user.email, callback);
        }
    }, function (err, results) {
        if (results.username) {
            req.flash(config.constant.flash.error, '用户名已被占用!');
            res.redirect('/join');
            return;
        }
        if (results.email) {
            req.flash(config.constant.flash.error, '邮箱已被占用!');
            res.redirect('/join');
            return;
        }
        userService.registerUser(user, function (err, user) {
            if (err) {
                next(err);
            } else {
                req.flash(config.constant.flash.success, '注册成功，请登录!');
                res.redirect('/login');
            }
        });
    });
});

router.get('/logout', function (req, res, next) {
    req.session.destroy();
    res.clearCookie(config.constant.cookie.user);
    res.redirect('/');
});


module.exports = router;

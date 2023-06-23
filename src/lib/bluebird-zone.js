/*
 * Based on Bluebird 3.4.1
 */
(function() {
  var Promise = window.Promise;
  var promiseProto = Promise.prototype;
  if (typeof Promise.mapSeries !== "function") {
    return; // Bluebird not loaded
  }

  /**
   * Takes any value and, if a function, makes it keep the current zone, i.e.
   * the one from inside which 'zonify' is called.
   */
  function zonify(value) {
    return typeof value === "function" ? Zone.current.wrap(value) : value;
  }

  /* Core */

  promiseProto.then = (function(_orig) {
    return function(fulfilledHandler, rejectedHandler) {
      return _orig.call(this, zonify(fulfilledHandler), zonify(rejectedHandler));
    }
  })(promiseProto.then);

  promiseProto.spread = (function(_orig) {
    return function(fulfilledHandler) {
      return _orig.call(this, zonify(fulfilledHandler));
    }
  })(promiseProto.spread);

  promiseProto.catch = (function(_orig) {
    return function(/* ...predicates, handler */) {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (arg instanceof Error) {
          args[i] = arg;
        } else {
          args[i] = zonify(arg);
        }
      }
      return _orig.apply(this, args);
    }
  })(promiseProto.catch);

  promiseProto.caught = promiseProto.catch;

  promiseProto.error = (function(_orig) {
    return function(rejectedHandler) {
      return _orig.call(this, zonify(rejectedHandler));
    }
  })(promiseProto.error);

  promiseProto.finally = (function(_orig) {
    return function(handler) {
      return _orig.call(this, zonify(handler));
    }
  })(promiseProto.finally);

  promiseProto.lastly = promiseProto.finally;

  // .bind - not needed

  Promise.join = (function(_orig) {
    return function(/* ...values, handler */) {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args[i] = arguments[i];
      }
      args[args.length - 1] = zonify(args[args.length - 1]);
      return _orig.apply(this, args);
    }
  })(Promise.join);

  // Promise.try - not needed
  // Promise.attempt - not needed
  // Promise.method - not needed
  // Promise.resolve - not needed
  // Promise.reject - not needed

  /* Synchronous inspection */

  // Synchronous inspection methods do not ever call code asynchronously, so they do not need patching

  /* Collections */

  // Promise.all - not needed
  // Promise.props - not needed
  // Promise.any - not needed
  // Promise.some - not needed

  Promise.map = (function(_orig) {
    return function(input, mapper, options) {
      return _orig.call(this,input, zonify(mapper), options);
    }
  })(Promise.map);

  Promise.reduce = (function(_orig) {
    return function(input, reducer, initialValue) {
      return _orig.call(this,input, zonify(reducer), initialValue);
    }
  })(Promise.reduce);

  Promise.filter = (function(_orig) {
    return function(input, filterer, options) {
      return _orig.call(this,input, zonify(filterer), options);
    }
  })(Promise.filter);

  Promise.each = (function(_orig) {
    return function(input, iterator) {
      return _orig.call(this,input, zonify(iterator));
    }
  })(Promise.each);

  Promise.mapSeries = (function(_orig) {
    return function(input, mapper) {
      return _orig.call(this,input, zonify(mapper));
    }
  })(Promise.mapSeries);

  // Promise.race - not needed
  // .all - not needed
  // .props - not needed
  // .any - not needed
  // .some - not needed

  promiseProto.map = (function(_orig) {
    return function(mapper, options) {
      return _orig.call(this, zonify(mapper), options);
    }
  })(promiseProto.map);

  promiseProto.reduce = (function(_orig) {
    return function( reducer, initialValue) {
      return _orig.call(this, zonify(reducer), initialValue);
    }
  })(promiseProto.reduce);

  promiseProto.filter = (function(_orig) {
    return function(filterer, options) {
      return _orig.call(this, zonify(filterer), options);
    }
  })(promiseProto.filter);

  promiseProto.each = (function(_orig) {
    return function(iterator) {
      return _orig.call(this,zonify(iterator));
    }
  })(promiseProto.each);

  promiseProto.mapSeries = (function(_orig) {
    return function(mapper) {
      return _orig.call(this, zonify(mapper));
    }
  })(promiseProto.mapSeries);

  /* Resource management */

  Promise.using = (function(_orig) {
    return function(/* ...resources, handler */) {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args[i] = arguments[i];
      }
      args[args.length - 1] = zonify(args[args.length - 1]);
      return _orig.apply(this, args);
    }
  })(Promise.using);

  promiseProto.disposer = (function(_orig) {
    return function(disposer) {
      return _orig.call(this, zonify(disposer));
    }
  })(promiseProto.disposer);

  /* Promisification */

  // Promise.promisify - not needed
  // Promise.promisifyAll - not needed

  Promise.fromCallback = (function(_orig) {
    return function(resolver, options) {
      return _orig.call(this, zonify(resolver), options);
    }
  })(Promise.fromCallback);

  Promise.fromNode = Promise.fromCallback;

  promiseProto.asCallback = (function(_orig) {
    return function(callback, options) {
      return _orig.call(this, zonify(callback), options);
    }
  })(promiseProto.asCallback);

  promiseProto.nodeify = promiseProto.asCallback;

  /* Timers */

  // .delay - not needed
  // .timeout - not needed

  /* Cancelation */

  // .cancel - not needed

  /* Generators */

  Promise.coroutine = (function(_orig) {
    var wrapped =  function(generatorFunction, options) {
      return _orig.call(this, zonify(generatorFunction), options);
    }
    wrapped.addYieldHandler = function(handler) {
      return _orig.addYieldHandler.call(this, zonify(handler));
    };
    return wrapped;
  })(Promise.coroutine);

  /* Utility */

  promiseProto.tap = (function(_orig) {
    return function(handler) {
      return _orig.call(this, zonify(handler));
    }
  })(promiseProto.tap);

  promiseProto.call = (function(_orig) {
    return function(methodName/*, ...args */) {
      return this.then(function(obj) {
        return obj[methodName].apply(obj, arguments);
      });
    }
  })(promiseProto.call);

  // .get - not needed
  // .return - not needed
  // .thenReturn - not needed
  // .throw - not needed
  // .thenThrow - not needed
  // .catchReturn - not needed
  // .catchThrow - not needed
  // .reflect - not needed

  Promise.getNewLibraryCopy = function() {
    throw new Error("Promise.getNewLibraryCopy not supported in this environment");
  };

  Promise.noConflict = function() {
    throw new Error("Promise.noConflict not supported in this environment");
  };

  // Promise.setScheduler - not needed

  /* Configuration */

  Promise.onPossiblyUnhandledRejection = (function(_orig) {
    return function(handler) {
      return _orig.call(this, zonify(handler));
    }
  })(Promise.onPossiblyUnhandledRejection);

  Promise.onUnhandledRejectionHandled = (function(_orig) {
    return function(handler) {
      return _orig.call(this, zonify(handler));
    }
  })(Promise.onUnhandledRejectionHandled);

  // .suppressUnhandledRejections - not needed

  promiseProto.done = (function(_orig) {
    return function(fulfilledHandler, rejectedHandler) {
      return _orig.call(this, zonify(fulfilledHandler), zonify(rejectedHandler));
    }
  })(promiseProto.done);

  // Promise.config - not needed

  /*
   * Suppress the error that Zone would throw because of the Promise constructor
   * being replaced. This is not strictly a Blubird issue, but just to keep Angular 2 happy.
   */
  Zone.assertZonePatched = function() {};
})();
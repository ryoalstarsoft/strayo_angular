// Pollyfill promises
export function initOSGJS () {
    P.defer = function() {
        var resolve, reject;
        var promise = new Promise(function() {
          resolve = arguments[0];
          reject = arguments[1];
        });
        return {
          resolve: resolve,
          reject: reject,
          promise: promise
        };
      }
}

export function stopViewer(viewer) {
  console.log('trying to delete');
  viewer.setSceneData(new osg.Node());
  window.cancelAnimationFrame(viewer._requestID);
  viewer.contextLost();
}
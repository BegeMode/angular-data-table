/* eslint-disable no-extend-native, no-bitwise */

(function extendArray() {
  // Taken from Reid's answer at http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
  /**
   * Array.prototype.move() - move element with shift from old_index to new_index
   */
  if(!Array.prototype.move) {
    Array.prototype.move = function (old_index, new_index) {
        while (old_index < 0) {
            old_index += this.length;
        }
        while (new_index < 0) {
            new_index += this.length;
        }
        if (new_index >= this.length) {
            var k = new_index - this.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        return this; // for testing purposes
    };
  }
  /**
   * Array.prototype.find()
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
   */
  if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
      value(predicate, thisArg) {
        if (this == null) {
          throw new TypeError('Array.prototype.find called on null or undefined');
        }

        if (!angular.isFunction(predicate)) {
          throw new TypeError('predicate must be a function');
        }

        const list = Object(this);
        const length = list.length >>> 0;

        let value;

        for (let i = 0; i < length; i += 1) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return value;
          }
        }

        return undefined;
      },
    });
  }

  /**
   * Array.prototype.findIndex()
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
   */
  if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
      value(predicate, thisArg) {
        if (this == null) {
          throw new TypeError('Array.prototype.findIndex called on null or undefined');
        }

        if (!angular.isFunction(predicate)) {
          throw new TypeError('predicate must be a function');
        }

        const list = Object(this);
        const length = list.length >>> 0;

        let value;

        for (let i = 0; i < length; i += 1) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return i;
          }
        }
        return -1;
      },
      enumerable: false,
      configurable: false,
      writable: false,
    });
  }
}());

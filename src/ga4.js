import gtag from "./gtag";
import format from "./format";

/*
Links
https://developers.google.com/gtagjs/reference/api
https://developers.google.com/tag-platform/gtagjs/reference
*/

/**
 * @typedef GaOptions
 * @type {Object}
 * @property {boolean} [cookieUpdate=true]
 * @property {number} [cookieExpires=63072000] Default two years
 * @property {string} [cookieDomain="auto"]
 * @property {string} [cookieFlags]
 * @property {string} [userId]
 * @property {string} [clientId]
 * @property {boolean} [anonymizeIp]
 * @property {string} [contentGroup1]
 * @property {string} [contentGroup2]
 * @property {string} [contentGroup3]
 * @property {string} [contentGroup4]
 * @property {string} [contentGroup5]
 * @property {boolean} [allowAdFeatures=true]
 * @property {boolean} [allowAdPersonalizationSignals]
 * @property {boolean} [nonInteraction]
 * @property {string} [page]
 */

/**
 * @typedef UaEventOptions
 * @type {Object}
 * @property {string} action
 * @property {string} category
 * @property {string} [label]
 * @property {number} [value]
 * @property {boolean} [nonInteraction]
 * @property {('beacon'|'xhr'|'image')} [transport]
 */

/**
 * @typedef InitOptions
 * @type {Object}
 * @property {string} trackingId
 * @property {GaOptions|any} [gaOptions]
 * @property {Object} [gtagOptions] New parameter
 */

export class GA4 {
  constructor() {
    this.reset();
  }

  reset = () => {
    this.isInitialized = false;

    this._testMode = false;
    this._currentMeasurementId;
    this._hasLoadedGA = false;
    this._isQueuing = false;
    this._queueGtag = [];
  };

  _gtag = (...args) => {
    if (!this._testMode) {
      if (this._isQueuing) {
        this._queueGtag.push(args);
      } else {
        gtag(...args);
      }
    } else {
      this._queueGtag.push(args);
    }
  };

  gtag(...args) {
    this._gtag(...args);
  }

  _loadGA = (
    GA_MEASUREMENT_ID,
    nonce,
    gtagUrl = "https://www.googletagmanager.com/gtag/js"
  ) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    if (!this._hasLoadedGA) {
      // Global Site Tag (gtag.js) - Google Analytics
      const script = document.createElement("script");
      script.async = true;
      script.src = `${gtagUrl}?id=${GA_MEASUREMENT_ID}`;
      if (nonce) {
        script.setAttribute("nonce", nonce);
      }
      document.body.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };

      this._hasLoadedGA = true;
    }
  };

  _toGtagOptions = (gaOptions) => {
    if (!gaOptions) {
      return;
    }

    const mapFields = {
      // Old https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#cookieUpdate
      // New https://developers.google.com/analytics/devguides/collection/gtagjs/cookies-user-id#cookie_update
      cookieUpdate: "cookie_update",
      cookieExpires: "cookie_expires",
      cookieDomain: "cookie_domain",
      cookieFlags: "cookie_flags", // must be in set method?
      userId: "user_id",
      clientId: "client_id",
      anonymizeIp: "anonymize_ip",
      // https://support.google.com/analytics/answer/2853546?hl=en#zippy=%2Cin-this-article
      contentGroup1: "content_group1",
      contentGroup2: "content_group2",
      contentGroup3: "content_group3",
      contentGroup4: "content_group4",
      contentGroup5: "content_group5",
      // https://support.google.com/analytics/answer/9050852?hl=en
      allowAdFeatures: "allow_google_signals",
      allowAdPersonalizationSignals: "allow_ad_personalization_signals",
      nonInteraction: "non_interaction",
      page: "page_path",
      hitCallback: "event_callback",
    };

    const gtagOptions = Object.entries(gaOptions).reduce(
      (prev, [key, value]) => {
        if (mapFields[key]) {
          prev[mapFields[key]] = value;
        } else {
          prev[key] = value;
        }

        return prev;
      },
      {}
    );

    return gtagOptions;
  };

  /**
   *
   * @param {InitOptions[]|string} GA_MEASUREMENT_ID
   * @param {Object} [options]
   * @param {string} [options.nonce]
   * @param {boolean} [options.testMode=false]
   * @param {string} [options.gtagUrl=https://www.googletagmanager.com/gtag/js]
   * @param {GaOptions|any} [options.gaOptions]
   * @param {Object} [options.gtagOptions] New parameter
   */
  initialize = (GA_MEASUREMENT_ID, options = {}) => {
    if (!GA_MEASUREMENT_ID) {
      throw new Error("Require GA_MEASUREMENT_ID");
    }

    const initConfigs =
      typeof GA_MEASUREMENT_ID === "string"
        ? [{ trackingId: GA_MEASUREMENT_ID }]
        : GA_MEASUREMENT_ID;

    this._currentMeasurementId = initConfigs[0].trackingId;
    const {
      gaOptions,
      gtagOptions,
      nonce,
      testMode = false,
      gtagUrl,
    } = options;
    this._testMode = testMode;

    if (!testMode) {
      this._loadGA(this._currentMeasurementId, nonce, gtagUrl);
    }
    if (!this.isInitialized) {
      this._gtag("js", new Date());

      initConfigs.forEach((config) => {
        const mergedGtagOptions = {
          ...this._toGtagOptions({ ...gaOptions, ...config.gaOptions }),
          ...gtagOptions,
          ...config.gtagOptions,
        };
        if (Object.keys(mergedGtagOptions).length) {
          this._gtag("config", config.trackingId, mergedGtagOptions);
        } else {
          this._gtag("config", config.trackingId);
        }
      });
    }
    this.isInitialized = true;

    if (!testMode) {
      const queues = [...this._queueGtag];
      this._queueGtag = [];
      this._isQueuing = false;
      while (queues.length) {
        const queue = queues.shift();
        this._gtag(...queue);
        if (queue[0] === "get") {
          this._isQueuing = true;
        }
      }
    }
  };

  set = (fieldsObject) => {
    if (!fieldsObject) {
      console.warn("`fieldsObject` is required in .set()");

      return;
    }

    if (typeof fieldsObject !== "object") {
      console.warn("Expected `fieldsObject` arg to be an Object");

      return;
    }

    if (Object.keys(fieldsObject).length === 0) {
      console.warn("empty `fieldsObject` given to .set()");
    }

    this._gaCommand("set", fieldsObject);
  };

  _gaCommandSendEvent = (
    eventCategory,
    eventAction,
    eventLabel,
    eventValue,
    fieldsObject
  ) => {
    this._gtag("event", eventAction, {
      event_category: eventCategory,
      event_label: eventLabel,
      value: eventValue,
      ...(fieldsObject && { non_interaction: fieldsObject.nonInteraction }),
      ...this._toGtagOptions(fieldsObject),
    });
  };

  _gaCommandSendEventParameters = (...args) => {
    if (typeof args[0] === "string") {
      this._gaCommandSendEvent(...args.slice(1));
    } else {
      const {
        eventCategory,
        eventAction,
        eventLabel,
        eventValue,
        // eslint-disable-next-line no-unused-vars
        hitType,
        ...rest
      } = args[0];
      this._gaCommandSendEvent(
        eventCategory,
        eventAction,
        eventLabel,
        eventValue,
        rest
      );
    }
  };

  _gaCommandSendTiming = (
    timingCategory,
    timingVar,
    timingValue,
    timingLabel
  ) => {
    this._gtag("event", "timing_complete", {
      name: timingVar,
      value: timingValue,
      event_category: timingCategory,
      event_label: timingLabel,
    });
  };

  _gaCommandSendPageview = (page, fieldsObject) => {
    if (fieldsObject && Object.keys(fieldsObject).length) {
      const { title, location, ...rest } = this._toGtagOptions(fieldsObject);

      this._gtag("event", "page_view", {
        ...(page && { page_path: page }),
        ...(title && { page_title: title }),
        ...(location && { page_location: location }),
        ...rest,
      });
    } else if (page) {
      this._gtag("event", "page_view", { page_path: page });
    } else {
      this._gtag("event", "page_view");
    }
  };

  _gaCommandSendPageviewParameters = (...args) => {
    if (typeof args[0] === "string") {
      this._gaCommandSendPageview(...args.slice(1));
    } else {
      const {
        page,
        // eslint-disable-next-line no-unused-vars
        hitType,
        ...rest
      } = args[0];
      this._gaCommandSendPageview(page, rest);
    }
  };

  // https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#send
  _gaCommandSend = (...args) => {
    const hitType = typeof args[0] === "string" ? args[0] : args[0].hitType;

    switch (hitType) {
      case "event":
        this._gaCommandSendEventParameters(...args);
        break;
      case "pageview":
        this._gaCommandSendPageviewParameters(...args);
        break;
      case "timing":
        this._gaCommandSendTiming(...args.slice(1));
        break;
      case "screenview":
      case "transaction":
      case "item":
      case "social":
      case "exception":
        console.warn(`Unsupported send command: ${hitType}`);
        break;
      default:
        console.warn(`Send command doesn't exist: ${hitType}`);
    }
  };

  _gaCommandSet = (...args) => {
    if (typeof args[0] === "string") {
      args[0] = { [args[0]]: args[1] };
    }
    this._gtag("set", this._toGtagOptions(args[0]));
  };

  _gaCommand = (command, ...args) => {
    switch (command) {
      case "send":
        this._gaCommandSend(...args);
        break;
      case "set":
        this._gaCommandSet(...args);
        break;
      default:
        console.warn(`Command doesn't exist: ${command}`);
    }
  };

  ga = (...args) => {
    if (typeof args[0] === "string") {
      this._gaCommand(...args);
    } else {
      const [readyCallback] = args;
      this._gtag("get", this._currentMeasurementId, "client_id", (clientId) => {
        this._isQueuing = false;
        const queues = this._queueGtag;

        readyCallback({
          get: (property) =>
            property === "clientId"
              ? clientId
              : property === "trackingId"
              ? this._currentMeasurementId
              : property === "apiVersion"
              ? "1"
              : undefined,
        });

        while (queues.length) {
          const queue = queues.shift();
          this._gtag(...queue);
        }
      });

      this._isQueuing = true;
    }

    return this.ga;
  };

  /**
   * @param {UaEventOptions|string} optionsOrName
   * @param {Object} [params]
   */
  event = (optionsOrName, params) => {
    if (typeof optionsOrName === "string") {
      this._gtag("event", optionsOrName, this._toGtagOptions(params));
    } else {
      const { action, category, label, value, nonInteraction, transport } =
        optionsOrName;
      if (!category || !action) {
        console.warn("args.category AND args.action are required in event()");

        return;
      }

      // Required Fields
      const fieldObject = {
        hitType: "event",
        eventCategory: format(category),
        eventAction: format(action),
      };

      // Optional Fields
      if (label) {
        fieldObject.eventLabel = format(label);
      }

      if (typeof value !== "undefined") {
        if (typeof value !== "number") {
          console.warn("Expected `args.value` arg to be a Number.");
        } else {
          fieldObject.eventValue = value;
        }
      }

      if (typeof nonInteraction !== "undefined") {
        if (typeof nonInteraction !== "boolean") {
          console.warn("`args.nonInteraction` must be a boolean.");
        } else {
          fieldObject.nonInteraction = nonInteraction;
        }
      }

      if (typeof transport !== "undefined") {
        if (typeof transport !== "string") {
          console.warn("`args.transport` must be a string.");
        } else {
          if (["beacon", "xhr", "image"].indexOf(transport) === -1) {
            console.warn(
              "`args.transport` must be either one of these values: `beacon`, `xhr` or `image`"
            );
          }

          fieldObject.transport = transport;
        }
      }

      this._gaCommand("send", fieldObject);
    }
  };

  send = (fieldObject) => {
    this._gaCommand("send", fieldObject);
  };
}

export default new GA4();

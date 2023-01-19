import gtag from "./gtag";
import GA4 from "./ga4";

const newDate = new Date("2020-01-01");
jest.mock("./gtag");
jest.useFakeTimers("modern").setSystemTime(newDate.getTime());

describe("GA4", () => {
  // Given
  const GA_MEASUREMENT_ID = "GA_MEASUREMENT_ID";

  beforeEach(() => {
    gtag.mockReset();
    GA4.reset();
  });

  describe("GA4.initialize()", () => {
    it("initialize() default", () => {
      // When
      GA4.initialize(GA_MEASUREMENT_ID);

      // Then
      expect(gtag).toHaveBeenNthCalledWith(1, "js", newDate);
      expect(gtag).toHaveBeenNthCalledWith(2, "config", GA_MEASUREMENT_ID);
      expect(gtag).toHaveBeenCalledTimes(2);
    });

    it("initialize() with options", () => {
      // Given
      const options = {
        gaOptions: {
          cookieUpdate: false,
        },
      };

      // When
      GA4.initialize(GA_MEASUREMENT_ID, options);

      // Then
      expect(gtag).toHaveBeenNthCalledWith(1, "js", newDate);
      expect(gtag).toHaveBeenNthCalledWith(2, "config", GA_MEASUREMENT_ID, {
        cookie_update: false,
      });
      expect(gtag).toHaveBeenCalledTimes(2);
    });

    it("initialize() in test mode", () => {
      // Given
      const options = {
        testMode: true,
      };
      const command = "send";
      const object = { hitType: "pageview" };

      // When
      GA4.initialize(GA_MEASUREMENT_ID, options);
      GA4.ga(command, object);

      // Then
      expect(gtag).toHaveBeenCalledTimes(0);
    });

    it("initialize() multiple products", () => {
      // Given
      const GA_MEASUREMENT_ID2 = "GA_MEASUREMENT_ID2";
      const config = [
        { trackingId: GA_MEASUREMENT_ID },
        { trackingId: GA_MEASUREMENT_ID2 },
      ];

      // When
      GA4.initialize(config);

      // Then
      expect(gtag).toHaveBeenNthCalledWith(1, "js", newDate);
      expect(gtag).toHaveBeenNthCalledWith(2, "config", GA_MEASUREMENT_ID);
      expect(gtag).toHaveBeenNthCalledWith(3, "config", GA_MEASUREMENT_ID2);
      expect(gtag).toHaveBeenCalledTimes(3);
    });
  });

  describe("GA4.ga()", () => {
    it("ga() send pageview", () => {
      // Given
      const command = "send";
      const object = { hitType: "pageview" };

      // When
      GA4.ga(command, object);

      // Then
      expect(gtag).toHaveBeenNthCalledWith(1, "event", "page_view");
    });

    it("ga() send timing", () => {
      // Given
      const command = "send";
      const hitType = "timing";
      const timingCategory = "DOM";
      const timingVar = "first-contentful-paint";
      const timingValue = 120;

      // When
      GA4.ga(command, hitType, timingCategory, timingVar, timingValue);

      // Then
      expect(gtag).toHaveBeenNthCalledWith(1, "event", "timing_complete", {
        event_category: timingCategory,
        name: timingVar,
        value: timingValue,
      });
    });

    it("ga() callback", (done) => {
      // Given
      const clientId = "clientId value";
      gtag.mockImplementationOnce((command, target, field_name, cb) =>
        cb(clientId)
      );

      const callback = jest.fn((tracker) => {
        const trackerClientId = tracker.get("clientId");
        const trackerTrackingId = tracker.get("trackingId");
        const trackerApiVersion = tracker.get("apiVersion");
        expect(trackerClientId).toEqual(clientId);
        expect(trackerTrackingId).toEqual(GA_MEASUREMENT_ID);
        expect(trackerApiVersion).toEqual("1");
        done();
      });

      // When
      GA4.ga(callback);

      // Then
      expect(gtag).toHaveBeenNthCalledWith(
        1,
        "get",
        GA_MEASUREMENT_ID,
        "client_id",
        expect.any(Function)
      );
    });

    it("ga() async callback", (done) => {
      // Given
      const clientId = "clientId value";
      gtag.mockImplementationOnce((command, target, field_name, cb) =>
        cb(clientId)
      );

      const callback = jest.fn(async (tracker) => {
        const trackerClientId = tracker.get("clientId");
        expect(trackerClientId).toEqual(clientId);
        done();
      });

      // When
      GA4.ga(callback);

      // Then
      expect(gtag).toHaveBeenNthCalledWith(
        1,
        "get",
        GA_MEASUREMENT_ID,
        "client_id",
        expect.any(Function)
      );
    });

    it("ga() callback queue", (done) => {
      // Given
      const clientId = "clientId value";
      gtag.mockImplementationOnce((command, target, field_name, cb) => {
        setImmediate(() => cb(clientId));
      });

      const callback = jest.fn(() => {
        GA4.ga("send", { hitType: "pageview" });
        expect(gtag).toHaveBeenNthCalledWith(2, "event", "page_view");
        done();
      });

      // When
      GA4.ga(callback);
      GA4.ga("send", "event", "category value");

      // Then
      expect(gtag).toHaveBeenNthCalledWith(
        1,
        "get",
        GA_MEASUREMENT_ID,
        "client_id",
        expect.any(Function)
      );
      expect(gtag).toHaveBeenCalledTimes(1);
      expect(GA4._isQueuing).toBeTruthy();
      expect(GA4._queueGtag).toHaveLength(1);

      jest.runAllTimers();

      expect(GA4._isQueuing).toBeFalsy();
      expect(GA4._queueGtag).toHaveLength(0);
      expect(gtag).toHaveBeenNthCalledWith(3, "event", undefined, {
        event_category: "category value",
      });
    });
  });

  describe("GA4.send()", () => {
    it("send() pageview", () => {
      // Given
      const object = { hitType: "pageview" };

      // When
      GA4.send(object);

      // Then
      expect(gtag).toHaveBeenNthCalledWith(1, "event", "page_view");
    });
  });

  describe("GA4.event()", () => {
    it("event() custom events", () => {
      // Given
      const eventName = "screen_view";
      const eventParams = {
        app_name: "myAppName",
        screen_name: "Home",
      };

      // When
      GA4.event(eventName, eventParams);

      // Then
      expect(gtag).toHaveBeenNthCalledWith(1, "event", eventName, eventParams);
    });

    it("event() simple", () => {
      // Given
      const object = {
        category: "category value",
        action: "action value",
        label: "label value",
        nonInteraction: true,
      };

      // When
      GA4.event(object);

      // Then
      expect(gtag).toHaveBeenNthCalledWith(1, "event", "Action Value", {
        event_category: "Category Value",
        event_label: "Label Value",
        non_interaction: true,
      });
    });
  });

  describe("GA4.set()", () => {
    it("set()", () => {
      // Given
      const object = {
        anonymizeIp: true,
        referrer: "/signup",
        allowAdFeatures: "allowAdFeatures value",
        allowAdPersonalizationSignals: "allowAdPersonalizationSignals value",
        page: "/home",
      };

      // When
      GA4.set(object);

      // Then
      expect(gtag).toHaveBeenNthCalledWith(1, "set", {
        anonymize_ip: true,
        referrer: "/signup",
        allow_google_signals: "allowAdFeatures value",
        allow_ad_personalization_signals: "allowAdPersonalizationSignals value",
        page_path: "/home",
      });
    });
  });

  describe("Reference", () => {
    it("pageview", () => {
      // Old https://developers.google.com/analytics/devguides/collection/analyticsjs/pages
      // New https://developers.google.com/gtagjs/reference/event#page_view

      // Given
      const hitType = "pageview";
      const path = "/location-pathname";
      const title = "title value";

      // When / Then

      // Without parameters
      GA4.send(hitType);
      expect(gtag).toHaveBeenNthCalledWith(1, "event", "page_view");
      GA4.send({ hitType });
      expect(gtag).toHaveBeenNthCalledWith(2, "event", "page_view");
      GA4.ga("send", hitType);
      expect(gtag).toHaveBeenNthCalledWith(3, "event", "page_view");

      // With path parameter
      GA4.send({ hitType, page: path });
      expect(gtag).toHaveBeenNthCalledWith(4, "event", "page_view", {
        page_path: path,
      });
      GA4.ga("send", hitType, path);
      expect(gtag).toHaveBeenNthCalledWith(5, "event", "page_view", {
        page_path: path,
      });

      // With path and title parameter
      GA4.send({ hitType, page: path, title });
      expect(gtag).toHaveBeenNthCalledWith(6, "event", "page_view", {
        page_path: path,
        page_title: title,
      });
      GA4.ga("send", hitType, path, { title });
      expect(gtag).toHaveBeenNthCalledWith(7, "event", "page_view", {
        page_path: path,
        page_title: title,
      });
    });
  });

  describe("Web vitals", () => {
    it("Web vitals", () => {
      // https://github.com/GoogleChrome/web-vitals/blob/main/README.md
      function sendToGoogleAnalytics({ name, delta, value, id }) {
        GA4.send({
          hitType: "event",
          eventCategory: "Web Vitals",
          eventAction: name,
          eventLabel: id,
          nonInteraction: true,
          // Built-in params:
          value: Math.round(name === "CLS" ? delta * 1000 : delta), // Use `delta` so the value can be summed.
          // Custom params:
          metric_id: id, // Needed to aggregate events.
          metric_value: value, // Optional.
          metric_delta: delta, // Optional.

          // OPTIONAL: any additional params or debug info here.
          // See: https://web.dev/debug-web-vitals-in-the-field/
          // metric_rating: 'good' | 'ni' | 'poor',
          // debug_info: '...',
          // ...
        });
      }

      sendToGoogleAnalytics({
        name: "CLS",
        delta: 12.34,
        value: 1,
        id: "v2-1632380328370-6426221164013",
      });

      expect(gtag).toHaveBeenNthCalledWith(1, "event", "CLS", {
        event_category: "Web Vitals",
        event_label: "v2-1632380328370-6426221164013",
        metric_delta: 12.34,
        metric_id: "v2-1632380328370-6426221164013",
        metric_value: 1,
        non_interaction: true,
        value: 12340,
      });
    });
  });
});

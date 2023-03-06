# React Google Analytics 4

## Migrate from old react-ga

```js
// Simply replace `react-ga` with `react-ga4` and remove `ReactGA.pageview()`
// import ReactGA from "react-ga";
import ReactGA from "react-ga4";
```

## Install

```bash
npm i react-ga4
```

## Usage

```js
import ReactGA from "react-ga4";

ReactGA.initialize("your GA measurement id");
```

## Example

More example can be found in [test suite](src/ga4.test.js)

```js
// Multiple products (previously known as trackers)
ReactGA.initialize([
  {
    trackingId: "your GA measurement id",
    gaOptions: {...}, // optional
    gtagOptions: {...}, // optional
  },
  {
    trackingId: "your second GA measurement id",
  },
]);

// Send pageview with a custom path
ReactGA.send({ hitType: "pageview", page: "/my-path", title: "Custom Title" });

// Send a custom event
ReactGA.event({
  category: "your category",
  action: "your action",
  label: "your label", // optional
  value: 99, // optional, must be a number
  nonInteraction: true, // optional, true/false
  transport: "xhr", // optional, beacon/xhr/image
});
```

## Reference

#### ReactGA.initialize(GA_MEASUREMENT_ID, options)

| Parameter           | Notes                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| GA_MEASUREMENT_ID   | `string` Required                                                                                                       |
| options.nonce       | `string` Optional Used for Content Security Policy (CSP) [more](https://developers.google.com/tag-manager/web/csp)      |
| options.testMode    | `boolean` Default false                                                                                                 |
| options.gtagUrl     | `string` Default `https://www.googletagmanager.com/gtag/js`                                                             |
| options.gaOptions   | `object` Optional [Reference](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference) |
| options.gtagOptions | `object` Optional                                                                                                       |

#### ReactGA.set(fieldsObject)

| Parameter    | Notes             |
| ------------ | ----------------- |
| fieldsObject | `object` Required |

#### ReactGA.event(name, params)

This method signature are NOT for `UA-XXX`

| Parameter | Notes                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| name      | `string` Required A [recommended event](https://developers.google.com/tag-platform/gtagjs/reference/events) or a custom event |
| params    | `object` Optional                                                                                                             |

#### ReactGA.event(options)

| Parameter              | Notes                               |
| ---------------------- | ----------------------------------- |
| options                | `object` Required                   |
| options.action         | `string` Required                   |
| options.category       | `string` Required                   |
| options.label          | `string` Optional                   |
| options.value          | `number` Optional                   |
| options.nonInteraction | `boolean` Optional                  |
| options.transport      | `'beacon'\|'xhr'\|'image'` Optional |

#### ReactGA.send(fieldsObject)

| Parameter    | Notes             |
| ------------ | ----------------- |
| fieldsObject | `object` Required |

#### ReactGA&#46;gtag(...args)

#### ReactGA&#46;ga(...args)

### Extending

```js
import { ReactGAImplementation } from "react-ga4";

class MyCustomOverriddenClass extends ReactGAImplementation {}

export default new MyCustomOverriddenClass();
```

## Debugging

Use [Google Analytics Debugger Chrome Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna?hl=en) to see logs

## Maintainer

[Han Lin Yap](https://github.com/codler)

## License

MIT

const smallWords =
  /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
function toTitleCase(string: string): string {
  return string
    .toString()
    .trim()
    .replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, (match, index, title) => {
      if (
        index > 0 &&
        index + match.length !== title.length &&
        match.search(smallWords) > -1 &&
        title.charAt(index - 2) !== ":" &&
        (title.charAt(index + match.length) !== "-" ||
          title.charAt(index - 1) === "-") &&
        title.charAt(index - 1).search(/[^\s-]/) < 0
      ) {
        return match.toLowerCase();
      }

      if (match.substr(1).search(/[A-Z]|\../) > -1) {
        return match;
      }

      return match.charAt(0).toUpperCase() + match.substr(1);
    });
}

// See if s could be an email address. We don't want to send personal data like email.
// https://support.google.com/analytics/answer/2795983?hl=en
function mightBeEmail(s: string): boolean {
  // There's no point trying to validate rfc822 fully, just look for ...@...
  return typeof s === "string" && s.indexOf("@") !== -1;
}

const redacted = "REDACTED (Potential Email Address)";
function redactEmail(string: string): string {
  if (mightBeEmail(string)) {
    console.warn("This arg looks like an email address, redacting.");

    return redacted;
  }

  return string;
}

export default function format(
  s: string = "",
  titleCase: boolean = true,
  redactingEmail: boolean = true
): string {
  let _str = s || "";

  if (titleCase) {
    _str = toTitleCase(s);
  }

  if (redactingEmail) {
    _str = redactEmail(_str);
  }

  return _str;
}

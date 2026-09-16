/**
 * Synthetic sample calendar built as an explicit CRLF string.
 *
 * Building it programmatically (rather than reading a .ics file) guarantees the
 * exact CRLF line endings and folded lines regardless of how the repository
 * checks out text files (autocrlf etc.), which matters for byte-exact roundtrip
 * assertions.
 *
 * Includes the tricky features the editor must preserve:
 *  - VALUE=DATE all-day event
 *  - TZID=Europe/Berlin with a VTIMEZONE (STANDARD + DAYLIGHT)
 *  - multiple VALARM blocks
 *  - X-ALT-DESC;FMTTYPE=text/html with folded HTML
 *  - X-MICROSOFT-* properties
 *  - an event spanning midnight in local time
 */

const L: string[] = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Example Corp//ICS Editor Test//EN",
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
  "X-WR-CALNAME:Testkalender",
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Berlin",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
  "BEGIN:VEVENT",
  "UID:allday-0001@example.org",
  "DTSTAMP:20260101T120000Z",
  "DTSTART;VALUE=DATE:20261224",
  "DTEND;VALUE=DATE:20261225",
  "SUMMARY:Heiligabend (ganztägig)",
  "CATEGORIES:Feiertag",
  "X-MICROSOFT-CDO-BUSYSTATUS:FREE",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:midnight-0002@example.org",
  "DTSTAMP:20260101T120000Z",
  "DTSTART;TZID=Europe/Berlin:20261224T231500",
  "DTEND;TZID=Europe/Berlin:20261225T010000",
  "SUMMARY:Christmette",
  "LOCATION:St. Marien",
  "DESCRIPTION:Über Mitternacht hinaus.",
  "X-ALT-DESC;FMTTYPE=text/html:<html><body><p>Ein <b>langer</b> HTML-Text der",
  " sicher \u00fcber die 75-Oktett-Grenze hinausgeht und deshalb \u00fcber mehrere phys",
  " ische Zeilen gefaltet wird, damit der Roundtrip-Test das Entfalten und Falt",
  " en pr\u00fcfen kann.</p></body></html>",
  "X-MICROSOFT-CDO-BUSYSTATUS:BUSY",
  "BEGIN:VALARM",
  "ACTION:DISPLAY",
  "DESCRIPTION:Erinnerung 1",
  "TRIGGER:-PT30M",
  "END:VALARM",
  "BEGIN:VALARM",
  "ACTION:DISPLAY",
  "DESCRIPTION:Erinnerung 2",
  "TRIGGER:-PT1H",
  "END:VALARM",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:weekly-0003@example.org",
  "DTSTAMP:20260101T120000Z",
  "DTSTART;TZID=Europe/Berlin:20260106T180000",
  "DTEND;TZID=Europe/Berlin:20260106T193000",
  "RRULE:FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20260331T215959Z",
  "EXDATE;TZID=Europe/Berlin:20260119T180000",
  "SUMMARY:Wochenserie",
  "END:VEVENT",
  "END:VCALENDAR",
];

/** The sample calendar with CRLF line endings and a trailing CRLF. */
export const SAMPLE_ICS: string = L.join("\r\n") + "\r\n";

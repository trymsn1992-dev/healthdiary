declare module 'ical.js' {
    function parse(input: string): any;

    class Component {
        constructor(jCal: any);
        getAllSubcomponents(name: string): any[];
        getFirstPropertyValue(name: string): any;
    }

    class Event {
        constructor(component: any);
        summary: string;
        location: string;
        startDate: Time;
        endDate: Time;
    }

    class Time {
        toJSDate(): Date;
        isDate: boolean;
    }

    const ICAL: {
        parse: typeof parse;
        Component: typeof Component;
        Event: typeof Event;
        Time: typeof Time;
    };

    export default ICAL;
}

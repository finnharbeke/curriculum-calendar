import sys, json, os, calendar
from cal import get_cal, load_cal, path_cal, FORMAT
from datetime import date, datetime

def print_all_currs():
    for name in os.listdir('src/curricula'):
        if name.endswith('.csv'):
            print(name[:-4])

def get_all_cals():
    calendars = []
    for name in os.listdir('src/curricula'):
        if name.endswith('.csv'):
            d = {}
            d['name'] = name[:-4]
            d['events'] = get_cal(load_cal(path_cal(name[:-4])), name[:-4], printOutput=False)
            calendars.append(d)
    print(json.dumps(calendars))

def soonest(count):
    all_events = []
    for i, name in enumerate(os.listdir('src/calendars')):
        if name.endswith('.csv'):
            name = name[:-4]
            for event in get_cal(load_cal(path_cal(name)), name, printOutput=False):
                event['name'] = name
                event['index'] = i+1
                all_events.append(event)

    all_events = list(filter(lambda e: (datetime.strptime(e['start'], FORMAT) - datetime.now()).total_seconds() >= 0, all_events))
    all_events.sort(key=lambda e: (datetime.strptime(e['start'], FORMAT) - datetime.now()).total_seconds())
    for e in all_events[:10]:
        print(json.dumps(e))


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == 'print_all_currs':
        print_all_currs()
    elif cmd == 'get_all_cals':
        get_all_cals()
    elif cmd == 'get_month_matrix':
        print(calendar.monthcalendar(int(sys.argv[2]), int(sys.argv[3])))
    elif cmd == 'today':
        today = date.today()
        print(today.day)
        print(today.month)
        print(today.year)
    elif cmd == 'soonest':
        soonest(int(sys.argv[2]))
    else:
        print('unknown command')
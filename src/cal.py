import pandas as pd
import datetime
import json
import sys
import os
from curriculum import get_curr, load_curr, save_curr, path_curr

FORMAT = '%d.%m.%Y, %H:%M'

def load_cal(path):
    df = pd.read_csv(path, sep=',', quotechar='"', index_col='index')
    return df

def create_cal():
    df = pd.DataFrame(columns=['index', 'start', 'end']).set_index('index')
    return df

def save_cal(df, path):
    df.to_csv(path, sep=',', quotechar='"')

def add_cal(df, year, month, day, starthours, startmin, dhours, dmin):
    """
    add new event to the calendar
    :df: pd.DataFrame
    :year: str of 4-digit
    :month: str, 1-12
    :day: str, 1-31
    :starthours: str, 0-23
    :startmin: str, 0-59
    :dhours: str of int
    :dmin: str of min
    """
    start = datetime.datetime(int(year), int(month), int(day), hour=int(starthours), minute=int(startmin))
    delta = datetime.timedelta(hours=int(dhours), minutes=int(dmin))
    end = start+delta
    if len(df):
        index = max(df.index) + 1
    else:
        index = 0

    return df.append(pd.DataFrame([[index, start.strftime(FORMAT), end.strftime(FORMAT)]], columns=['index', 'start', 'end']).set_index('index'))

def remove_cal(df, index):
    """
    remove row with index index
    :df: pd.DataFrame
    :index: str of integer
    """
    return df.drop(index=int(index))

def get_cal(df, name, printOutput=True):
    events = []
    for i, row in df.iterrows():
        d = {}
        d['index'] = i
        start = datetime.datetime.strptime(row['start'], FORMAT)
        if (start - datetime.datetime.now()).total_seconds() < 0:
            continue #passed already
        end = datetime.datetime.strptime(row['end'], FORMAT)
        d['start'] = row['start']
        d['year'] = start.year
        d['month'] = start.month
        d['day'] = start.day
        d['hour'] = start.hour
        d['minute'] = start.minute
        d['deltahours'] = (end - start).total_seconds() / 3600
        events.append(d)
    
    curriculum_rows = get_curr(load_curr(path_curr(name)), printOut=False)
    total_hours = 0
    final_events = []
    for event in events:
        session_courses = []
        session_hours = event['deltahours']
        session_hours_left = session_hours
        
        cumul_hours = 0
        i = 0
        while session_hours_left > 0 and i < len(curriculum_rows):
            course = curriculum_rows[i]
            cumul_hours += course['hours']
            if cumul_hours > total_hours:
                # this course is included in the event
                if cumul_hours - course['hours'] < total_hours:
                    # course has already begun
                    todo = cumul_hours - total_hours
                    if todo >= session_hours_left:
                        # continue/finish this course without other one following
                        # overwrite hours to hours this course is worked on in this session
                        session_courses.append({**course, 'hours': session_hours_left})
                        session_hours_left = 0
                    else:
                        # will finish course AND have time left
                        session_courses.append({**course, 'hours': todo})
                        session_hours_left -= todo
                else:
                    # course starts now
                    if course['hours'] <= session_hours_left:
                        # will finish
                        session_courses.append({**course})
                        session_hours_left -= course['hours']
                    else:
                        # won't finish
                        session_courses.append({**course, 'hours': session_hours_left})
                        session_hours_left = 0
            i += 1

        if session_hours_left:
            session_courses.append({"hours": session_hours_left, "title": "Nothing left", "link": 'None', "content": "Nothing"})
        event['courses'] = session_courses
        total_hours += session_hours
        if printOutput:
            print(json.dumps(event))
        else:
            final_events.append(event)
    if not printOutput:
        return final_events

def path_cal(name):
    return os.path.join(os.path.split(__file__)[0], 'calendars', f'{name}.csv')

if __name__ == "__main__":
    cmd = sys.argv[1]
    cmd = cmd.strip("'")
    name = sys.argv[2]
    name = name.strip("'")
    path = path_cal(name)
    
    if not cmd == 'create':
        df = load_cal(path)
    # execute commands
    if cmd == 'create':
        df = create_cal()

    elif cmd == 'get':
        get_cal(df, name)

    elif cmd == 'remove':
        df = remove_cal(df, *[x.strip("'") for x in sys.argv[3:]])
    elif cmd == 'add':
        df = add_cal(df, *[x.strip("'") for x in sys.argv[3:]])
    else:
        raise ValueError('Unkown Command')
    if cmd != 'get':
        save_cal(df, path)
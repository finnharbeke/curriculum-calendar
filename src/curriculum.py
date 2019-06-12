import pandas as pd
import json
import sys
import os

def load_curr(path):
    df = pd.read_csv(path, sep=',', quotechar='"', index_col='index')
    return df

def create_curr():
    df = pd.DataFrame(columns=['index', 'hours', 'title', 'link', 'content']).set_index('index')
    return df

def save_curr(df, path):
    df.to_csv(path, sep=',', quotechar='"')

def add_curr(df, hours, title, link, content):
    """
    add new row to the curriculum
    :df: pd.DataFrame
    :hours: str of float
    :title: str, title of course
    :link: str, link to course
    :content: str, content category
    """
    if len(df):
        index = max(df.index) + 1
    else:
        index = 0
    return df.append(pd.DataFrame([[index, float(hours), title, link, content]], columns=['index', 'hours', 'title', 'link', 'content']).set_index('index'))

def remove_curr(df, index):
    """
    remove row with index index
    :df: pd.DataFrame
    :index: str of integer
    """
    return df.drop(index=int(index))

def move_curr(df, index, dir):
    """
    move row up or down by one
    :df: pd.DataFrame
    :index: str of int
    :dir: one of ['up', 'down']
    """
    row_ind = list(df.index).index(int(index))
    if (row_ind == 0 and dir == 'up') or (row_ind == len(df)-1 and dir == 'down'):
        return df
    if dir == 'up':
        new_order = list(df.index)[:row_ind-1] + [df.index[row_ind]] + [df.index[row_ind-1]] + list(df.index)[row_ind+1:]
    elif dir == 'down':
        new_order = list(df.index)[:row_ind] + [df.index[row_ind+1]] + [df.index[row_ind]] + list(df.index)[row_ind+2:]
    else:
        raise ValueError('Invalid dir')
    return df.reindex(new_order)

def get_curr(df, printOut=True):
    l = []
    for i, row in df.iterrows():
        d = dict(row)
        d['index'] = i
        if printOut:
            print(json.dumps(d))
        else:
            l.append(d)
    if not printOut:
        return l

def path_curr(name):
    return os.path.join(os.path.split(__file__)[0], 'curricula', f'{name}.csv')

if __name__ == "__main__":
    cmd, name = sys.argv[1:3]
    cmd = cmd.strip("'")
    name = name.strip("'")
    path = path_curr(name)
    if not cmd == 'create':
        df = load_curr(path)
    if cmd == 'create':
        df = create_curr()
    elif cmd == 'get':
        get_curr(df)
    elif cmd == 'add':
        df = add_curr(df, *[x.strip("'") for x in sys.argv[3:]])
    elif cmd == 'remove':
        df = remove_curr(df, *[x.strip("'") for x in sys.argv[3:]])
    elif cmd == 'move':
        df = move_curr(df, *[x.strip("'") for x in sys.argv[3:]])
    else:
        raise ValueError('Unkown Command')
    if cmd != 'get':
        save_curr(df, path)
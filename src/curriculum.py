import pandas as pd
import sys

def load(path):
    df = pd.read_csv(path, sep=',', quotechar='"', index_col='index')
    return df

def create():
    df = pd.DataFrame(columns=['index', 'hours', 'title', 'link', 'content']).set_index('index')
    return df

def save(df, path):
    df.to_csv(path, sep=',', quotechar='"')

def add(df, hours, title, link, content):
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

def remove(df, index):
    """
    remove row with index index
    :df: pd.DataFrame
    :index: str of integer
    """
    return df.drop(index=int(index))

def move(df, index, dir):
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

if __name__ == "__main__":
    print(sys.argv)
    cmd, name = sys.argv[1:3]
    if not cmd == 'create':
        df = load(f'{name}.csv')
    if cmd == 'create':
        df = create()
    elif cmd == 'add':
        df = add(df, *sys.argv[3:])
    elif cmd == 'remove':
        df = remove(df, *sys.argv[3:])
    elif cmd == 'move':
        df = move(df, *sys.argv[3:])
    else:
        raise ValueError('Unkown Command')
    save(df, f'{name}.csv')
# -*- coding: utf-8 -*-

__version__ = '0.0.1'


class DotEnv:

    def __init__(self, path='.env'):
        self.path = path
        self.data = {}
        self.__read()

    ''' get key with default value '''
    def get(self, key, default=None):
        if key in self.data:
            value = self.data[key]
            if value == 'null' or len(value) == 0:
                return default
            return self.data[key]
        return default

    ''' show if specific key exists '''
    def has(self, key):
        return key in self.data

    ''' provide all data in dicts '''
    def all(self):
        return self.data

    ''' dump all data to screen '''
    def dump(self):
        print(self.data)

    ''' read configuration file '''
    def __read(self):
        with open(self.path, 'r') as file:
            for line in file.readlines():
                line = line.strip()
                # ignore comment line and empty/bad line
                if line.startswith('#') or '=' not in line:
                    continue
                self.__read_line(line)

    ''' parse a line with .env standards '''
    def __read_line(self, line):
        # find second quote mark
        quote_delimit = max(line.find("'", line.find("'") + 1), line.find('"', line.rfind('"')) + 1)
        # find comment at end of line
        comment_delimit = line.find('#', quote_delimit)
        # remove comment if exist at end of line
        if comment_delimit >= 0:
            line = line[:comment_delimit]
        key, value = map(lambda x: x.strip().strip("'").strip('"'), line.split('=', 1))
        # ignore bad key
        if len(key) == 0:
            return
        self.data[key] = value

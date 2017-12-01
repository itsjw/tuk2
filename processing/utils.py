import yaml
import pyhdb

class Connection:
    def __init__(self, credentials_filepath='credentials.yml'):
        self.connection = pyhdb.connect(**self._load_credentials(credentials_filepath))

    def __enter__(self):
        return self.connection

    def __exit__(self, exc_type, exc_value, traceback):
        self.connection.close()

    def _load_credentials(self, filepath):
        with open(filepath) as credentials_file:
            return yaml.load(credentials_file)

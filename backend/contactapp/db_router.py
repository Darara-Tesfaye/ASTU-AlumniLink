class MyDatabaseRouter:
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'contactapp':
            return 'secondary'
        elif model._meta.app_label == 'events':
            return 'events_db'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'contactapp':
            return 'secondary'
        elif model._meta.app_label == 'events':
            return 'events_db'
        return 'default'

    def db_for_sync(self, model, **hints):
        if model._meta.app_label == 'contactapp':
            return 'secondary'
        elif model._meta.app_label == 'events':
            return 'events_db'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        db_list = ('default', 'secondary', 'events_db')
        if obj1._state.db in db_list and obj2._state.db in db_list:
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == 'contactapp':
            return db == 'secondary'
        elif app_label == 'events':
            return db == 'events_db'
        return db == 'default'

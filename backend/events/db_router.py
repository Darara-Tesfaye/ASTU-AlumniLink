
# class MyDatabaseRouter:
#     def db_for_read(self, model, **hints):
#         """Direct read operations for the specific app to the relevant database."""
#         if model._meta.app_label == 'contactapp':
#             return 'secondary'  # Direct reads for contact app to the secondary database
#         elif model._meta.app_label == 'events':
#             return 'events_db'  # Direct reads for events app to the events database
#         return 'default'  # Default for other models

#     def db_for_write(self, model, **hints):
#         """Direct write operations for the specific app to the relevant database."""
#         if model._meta.app_label == 'contactapp':
#             return 'secondary'  # Direct writes for contact app to the secondary database
#         elif model._meta.app_label == 'events':
#             return 'events_db'  # Direct writes for events app to the events database
#         return 'default'  # Default for other models

#     def allow_relation(self, obj1, obj2, **hints):
#         """Allow relations between models from the same app or any related app."""
#         if obj1._meta.app_label == 'events' or obj2._meta.app_label == 'events':
#             return True
#         if obj1._meta.app_label == 'contactapp' or obj2._meta.app_label == 'contactapp':
#             return True
#         return None  # Disallow relations between unrelated apps

#     def allow_migrate(self, db, app_label, model_name=None, **hints):
#         """Control the migration for specific apps to the relevant database."""
#         if app_label == 'events':
#             return db == 'events_db'  # Allow migrations for events app to the events database
#         elif app_label == 'contactapp':
#             return db == 'secondary'  # Allow migrations for contact app to the secondary database
#         return db == 'default'  # Allow migrations for other apps to the default database

# class MyDatabaseRouter:
#     def db_for_read(self, model, **hints):
#         """Direct read operations to the relevant database."""
#         if model._meta.app_label == 'contactapp':
#             return 'secondary'  # Reads for contact app to secondary database
#         elif model._meta.app_label == 'events':
#             return 'events_db'  # Reads for events app to events database
#         return 'default'  # Default for other models

#     def db_for_write(self, model, **hints):
#         """Direct write operations to the relevant database."""
#         if model._meta.app_label == 'contactapp':
#             return 'secondary'
#         elif model._meta.app_label == 'events':
#             return 'events_db'
#         return 'default'

#     def allow_relation(self, obj1, obj2, **hints):
#         """Allow relations between models from the same app."""
#         if obj1._meta.app_label == 'events' or obj2._meta.app_label == 'events':
#             return True
#         if obj1._meta.app_label == 'contactapp' or obj2._meta.app_label == 'contactapp':
#             return True
#         return None  # Disallow relations between unrelated apps

#     def allow_migrate(self, db, app_label, model_name=None, **hints):
#         """Control the migration for specific apps to the relevant database."""
#         if app_label == 'events':
#             return db == 'events_db'  # Allow migrations for events app to the events database
#         elif app_label == 'contactapp':
#             return db == 'secondary'  # Allow migrations for contact app to the secondary database
#         return db == 'default'  # Allow migrations for other apps to the default database

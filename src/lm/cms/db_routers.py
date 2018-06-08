class CmsRouter(object):
    """
    """


    def db_for_read(self, model, **hints):
        app_label = model._meta.app_label
        if app_label == "app":
            return "app_server"
        return "default"


    def db_for_write(self, model, **hints):
        app_label = model._meta.app_label
        if app_label == "app":
            return "app_server"
        return "default"


    def allow_relation(self, obj1, obj2, **hints):
        if obj1._meta.app_label == 'auth' or \
           obj2._meta.app_label == 'auth':
           return True

        return None


    def allow_migrate(self, db, app_label, model_name=None, **hints):
        # Do not run any migrations on app_server or on app - this prevents
        # conflicts
        return db != "app_server" and app_label != "app"

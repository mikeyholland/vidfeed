from django.contrib import admin
from models import SiteUser


class SiteUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'feeds_created', 'date_joined', 'last_login', 'is_superuser',)

    def feeds_created(self, inst):
        return inst.feed_set.count()
    feeds_created.admin_order_field = 'feeds_created'

admin.site.register(SiteUser, SiteUserAdmin)

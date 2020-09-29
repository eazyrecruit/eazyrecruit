from django.conf.urls import url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    #url(r'^statement/(?P<id>[0-9a-zA-Z]{24})/$', views.statement, name='statement'),
    #url(r'^admin/', admin.site.urls),
    url(r'^resume$', views.resume, name='resume')
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# urlpatterns = format_suffix_patterns(urlpatterns)
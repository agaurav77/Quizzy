from django.conf.urls import patterns, include, url
from django.conf import settings
from django.contrib import admin
from quiz import views
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'quizzy_adv.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^register/', views.register, name='register'),
    url(r'^login/', views.user_login, name='login'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^q/', include('quiz.urls')),
)

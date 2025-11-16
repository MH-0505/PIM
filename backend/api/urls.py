from django.urls import path
from . import views

#PASSY C:\Users\marci>curl -X POST "http://127.0.0.1:8000/api/users/authenticate/" -H "Content-Type: application/json" -d "{\"email\": \"test@example.com\", \"password\": \"haslo\"}"

urlpatterns = [
    #endpoints
    path('hello/', views.hello),
    #USERS
    path('users/create/', views.create_user),
    path('users/authenticate/', views.authenticate_user),
    path('users/delete/', views.delete_user),
    path('users/change_email/', views.change_email),
    path('users/change_password/', views.change_password),

    path('contacts/add/', views.add_contact),
    path('contacts/list/', views.get_contacts_list),


]
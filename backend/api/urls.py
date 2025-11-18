from django.urls import path
from . import views

# PASSY C:\Users\marci>curl -X POST "http://127.0.0.1:8000/api/users/authenticate/" -H "Content-Type: application/json" -d "{\"email\": \"test@example.com\", \"password\": \"haslo123\"}"

urlpatterns = [
    # endpoints
    path('hello/', views.hello),
    # USERS
    path('users/create/', views.create_user),
    path('users/authenticate/', views.authenticate_user),
    path('users/delete/', views.delete_user),
    path('users/change_email/', views.change_email),
    path('users/change_password/', views.change_password),


    #CONTACTS
    path('contacts/add/', views.add_contact),
    path('contacts/list/', views.get_contacts_list),

    #CHATS
    path('chats/create-one-on-one/', views.create_or_get_chat_between_users),
    path('chats/user-chats/<uuid:user_id>/', views.get_user_chats),
    path('chats/user-chats-detailed/<user_id>/', views.get_user_chats_detailed),

    #MESSAGES
    path('messages/<uuid:chat_id>/', views.get_messages),
    path('messages/send/', views.send_message),

]

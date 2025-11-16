from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import User
from .models import Contact
from .serializers import UserSerializer
import hashlib

import jwt
from django.conf import settings
from datetime import datetime, timedelta


def require_auth(request):


    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return Response({"error": "Authorization header missing or invalid."},
                        status=status.HTTP_401_UNAUTHORIZED)

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload  # Zawiera user_id, email itd.

    except jwt.ExpiredSignatureError:
        return Response({"error": "Token expired."},
                        status=status.HTTP_401_UNAUTHORIZED)

    except jwt.InvalidTokenError:
        return Response({"error": "Invalid token."},
                        status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def hello(request):
    return Response({"message": "Hello from DRF API!"})

#USERS

@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save(created_at=timezone.now(), updated_at=timezone.now())
        return Response({
            "id": str(user.id),
            "email": user.email,
            "created_at": user.created_at
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def authenticate_user(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password are required."},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Invalid email or password."},
                        status=status.HTTP_401_UNAUTHORIZED)

    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    if hashed_password != user.hashed_password:
        return Response({"error": "Invalid email or password."},
                        status=status.HTTP_401_UNAUTHORIZED)


    payload = {
        "user_id": str(user.id),
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(hours=24),
        "iat": datetime.utcnow()
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    return Response({
        "token": token,
        "user": {
            "id": str(user.id),
            "email": user.email
        }
    }, status=status.HTTP_200_OK)



@api_view(['POST'])
def delete_user(request):
    user_id = request.data.get("id")
    if not user_id:
        return Response({"error": "User ID is required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({"message": "User deleted successfully."}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def change_email(request):
    user_id = request.data.get("id")
    new_email = request.data.get("new_email")

    if not user_id or not new_email:
        return Response({"error": "User ID and new_email are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    if User.objects.filter(email=new_email).exists():
        return Response({"error": "Email already in use."}, status=status.HTTP_400_BAD_REQUEST)

    user.email = new_email
    user.updated_at = timezone.now()
    user.save()
    return Response({"message": "Email updated successfully.", "id": str(user.id), "new_email": user.email})


@api_view(['POST'])
def change_password(request):
    user_id = request.data.get("id")
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not user_id or not old_password or not new_password:
        return Response({"error": "User ID, old_password and new_password are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    hashed_old = hashlib.sha256(old_password.encode()).hexdigest()
    if hashed_old != user.hashed_password:
        return Response({"error": "Old password is incorrect."}, status=status.HTTP_401_UNAUTHORIZED)

    user.hashed_password = hashlib.sha256(new_password.encode()).hexdigest()
    user.updated_at = timezone.now()
    user.save()
    return Response({"message": "Password updated successfully."})


#CONTACTS
@api_view(['POST'])
def add_contact(request):
    auth = require_auth(request)
    if isinstance(auth, Response):
        return auth

    user_id = auth["user_id"]
    contact_email = request.data.get("email")

    if not contact_email:
        return Response({"error": "email is required."},
                        status=status.HTTP_400_BAD_REQUEST)


    try:
        user = User.objects.get(id=user_id)
        if user.email == contact_email:
            return Response({"error": "You cannot add yourself as a contact."},
                            status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({"error": "Authenticated user not found."},
                        status=status.HTTP_404_NOT_FOUND)


    try:
        contact_user = User.objects.get(email=contact_email)
    except User.DoesNotExist:
        return Response({"error": "User with this email does not exist."},
                        status=status.HTTP_404_NOT_FOUND)


    if Contact.objects.filter(user_id=user_id, contact_id=contact_user.id).exists():
        return Response({"message": "Contact already added."},
                        status=status.HTTP_200_OK)


    Contact.objects.create(
        user_id_id=user_id,
        contact_id_id=contact_user.id
    )

    return Response({
        "message": "Contact added successfully.",
        "contact_id": str(contact_user.id),
        "email": contact_email
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def delete_contact(request):
    #TODO
    pass

@api_view(['GET'])
def get_contacts_list(request):
    auth = require_auth(request)
    if isinstance(auth, Response):
        return auth  # zwróci błąd JWT jeśli coś nie działa

    user_id = auth["user_id"]


    contacts = Contact.objects.filter(user_id=user_id).select_related("contact_id")


    contact_list = [
        {
            "id": str(c.contact_id.id),
            "email": c.contact_id.email,
            "added_at": c.created_at
        }
        for c in contacts
    ]

    return Response({"contacts": contact_list}, status=status.HTTP_200_OK)


#CHAT
@api_view(['POST'])
def create_chat(request):
    #TODO
    pass

@api_view(['POST'])
def delete_chat(request):
    #TODO
    pass

@api_view(['POST'])
def add_chat_participant(request):
    #TODO
    pass

@api_view(['POST'])
def remove_chat_participant(request):
    #TODO
    pass

#MESSAGES

@api_view(['POST'])
def send_message(request):
    #TODO
    pass




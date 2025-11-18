from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import User
from .models import Contact
from .serializers import UserSerializer
import hashlib
from .models import Chat
from .serializers import ChatSerializer
from .models import ChatParticipant
from .serializers import ChatParticipantSerializer
from .models import Message
from .serializers import MessageSerializer
import jwt
from django.conf import settings
from datetime import datetime, timedelta

from django.db.models import Count


def require_auth(request):


    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return Response({"error": "Authorization header missing or invalid."},
                        status=status.HTTP_401_UNAUTHORIZED)

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload

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
        return auth

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


# CHAT
@api_view(['POST'])
def create_chat(request):
    chat = Chat.objects.create()
    serializer = ChatSerializer(chat)
    return Response(serializer.data, status=201)


@api_view(['GET'])
def get_chats(request):
    chats = Chat.objects.all().order_by('-created_at')
    serializer = ChatSerializer(chats, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def delete_chat(request):
    #TODO
    pass

@api_view(['POST'])
def add_chat_participant(request):
    serializer = ChatParticipantSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    chat = serializer.validated_data['chat_id']
    user = serializer.validated_data['user_id']

    participant, created = ChatParticipant.objects.get_or_create(
        chat_id=chat,
        user_id=user
    )

    if not created:
        return Response({"error": "User is already in this chat"}, status=409)

    return Response(serializer.data, status=201)


@api_view(['GET'])
def get_user_chats(request, user_id):

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User does not exist"}, status=404)


    chat_ids = ChatParticipant.objects.filter(user_id=user).values_list("chat_id", flat=True)

    return Response(list(chat_ids), status=200)


@api_view(['POST'])
def create_or_get_chat_between_users(request):
    user_id_1 = request.data.get("user_id_1")
    user_id_2 = request.data.get("user_id_2")

    if not user_id_1 or not user_id_2:
        return Response({"error": "user_id_1 and user_id_2 are required"}, status=400)

    if user_id_1 == user_id_2:
        return Response({"error": "Cannot create chat with the same user twice"}, status=400)

    try:
        user1 = User.objects.get(id=user_id_1)
        user2 = User.objects.get(id=user_id_2)
    except User.DoesNotExist:
        return Response({"error": "One of the users does not exist"}, status=404)


    chats_user1 = ChatParticipant.objects.filter(user_id=user1).values_list("chat_id", flat=True)


    existing_chat = ChatParticipant.objects.filter(
        chat_id__in=chats_user1,
        user_id=user2
    ).values_list("chat_id", flat=True).first()

    if existing_chat:
        return Response({
            "chat_id": str(existing_chat),
            "other_user_email": user2.email,
            "created": False
        }, status=200)


    chat = Chat.objects.create()

    ChatParticipant.objects.create(chat_id=chat, user_id=user1)
    ChatParticipant.objects.create(chat_id=chat, user_id=user2)

    return Response({
        "chat_id": str(chat.id),
        "other_user_email": user2.email,
        "created": True
    }, status=201)


@api_view(['GET'])
def get_user_chats_detailed(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User does not exist"}, status=404)


    chat_list = Chat.objects.filter(participants__user_id=user)

    result = []

    for chat in chat_list:

        other_participant = (
            ChatParticipant.objects
            .filter(chat_id=chat)
            .exclude(user_id=user)
            .first()
        )

        if other_participant:
            other_user_email = other_participant.user_id.email
        else:
            other_user_email = "Unknown user"

        result.append({
            "chat_id": str(chat.id),
            "other_user_email": other_user_email
        })

    return Response(result, status=200)


@api_view(['POST'])
def remove_chat_participant(request):
    #TODO
    pass

#MESSAGES

@api_view(['GET'])
def get_messages(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id)
    except Chat.DoesNotExist:
        return Response({"error": "Chat not found"}, status=404)

    messages = Message.objects.filter(chat_id=chat).order_by("sent_at")
    serializer = MessageSerializer(messages, many=True)

    return Response(serializer.data, status=200)



@api_view(['POST'])
def send_message(request):
    sender_id = request.data.get("sender_id")
    chat_id = request.data.get("chat_id")
    content = request.data.get("content")

    if not sender_id or not chat_id or not content:
        return Response(
            {"error": "sender_id, chat_id and content are required"},
            status=400
        )

    try:
        chat = Chat.objects.get(id=chat_id)
    except Chat.DoesNotExist:
        return Response({"error": "Chat not found"}, status=404)

    try:
        sender = User.objects.get(id=sender_id)
    except User.DoesNotExist:
        return Response({"error": "Sender not found"}, status=404)


    if not ChatParticipant.objects.filter(chat_id=chat, user_id=sender).exists():
        return Response({"error": "User is not a participant of this chat"}, status=403)

    message = Message.objects.create(
        chat_id=chat,
        sender_id=sender,
        content=content
    )

    serializer = MessageSerializer(message)
    return Response(serializer.data, status=201)




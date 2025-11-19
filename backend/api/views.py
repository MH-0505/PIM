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
            .select_related("user_id")
            .first()
        )

        if other_participant:
            other_user_email = other_participant.user_id.email
            other_user_id = str(other_participant.user_id.id)
        else:
            other_user_email = "Unknown user"
            other_user_id = None

        result.append({
            "chat_id": str(chat.id),
            "other_user_email": other_user_email,
            "other_user_id": other_user_id,
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


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Game, User


@api_view(['POST'])
def create_game(request):
    player_1_id = request.data.get("player_1_id")
    player_2_id = request.data.get("player_2_id")

    if not player_1_id or not player_2_id:
        return Response({"error": "player_1_id and player_2_id are required"}, status=400)

    try:
        p1 = User.objects.get(id=player_1_id)
        p2 = User.objects.get(id=player_2_id)
    except User.DoesNotExist:
        return Response({"error": "One of the players does not exist"}, status=404)


    existing = (
        Game.objects.filter(player_1_id=p1, player_2_id=p2).first() or
        Game.objects.filter(player_1_id=p2, player_2_id=p1).first()
    )

    if existing:
        return Response({
            "message": "Game already exists",
            "game_id": existing.id
        }, status=200)


    game = Game.objects.create(
        player_1_id=p1,
        player_2_id=p2,
        player_1_symbol='X',
        player_2_symbol='O',
        current_turn=p1
    )

    return Response({
        "game_id": game.id,
        "player_1": p1.email,
        "player_2": p2.email,
    }, status=201)

@api_view(['GET'])
def get_game(request):
    p1 = request.GET.get("player_1_id")
    p2 = request.GET.get("player_2_id")

    if not p1 or not p2:
        return Response({"error": "player_1_id and player_2_id are required"}, status=400)


    game = Game.objects.filter(player_1_id=p1, player_2_id=p2).first()
    if not game:
        game = Game.objects.filter(player_1_id=p2, player_2_id=p1).first()

    if not game:
        return Response({"error": "Game not found"}, status=404)

    fields = {f"field_{i}": getattr(game, f"field_{i}") for i in range(1, 10)}

    return Response({
        "game_id": game.id,
        "player_1": str(game.player_1_id.id),
        "player_2": str(game.player_2_id.id),
        "player_1_symbol": game.player_1_symbol,
        "player_2_symbol": game.player_2_symbol,
        "current_turn": str(game.current_turn.id),
        "is_finished": game.is_finished,
        "winner": str(game.winner.id) if game.winner else None,
        "board": fields
    })



def check_winner(game):
    board = [getattr(game, f"field_{i}") for i in range(1, 10)]

    wins = [
        (0,1,2), (3,4,5), (6,7,8),  # poziomo
        (0,3,6), (1,4,7), (2,5,8),  # pionowo
        (0,4,8), (2,4,6)            # na skos
    ]

    for a, b, c in wins:
        if board[a] == board[b] == board[c] and board[a] != "EMPTY":
            return board[a]

    if "EMPTY" not in board:
        return "DRAW"

    return None



@api_view(['POST'])
def make_move(request):
    game_id = request.data.get("game_id")
    player_id = request.data.get("player_id")
    field = request.data.get("field")

    if not game_id or not player_id or not field:
        return Response({"error": "game_id, player_id, and field are required"}, status=400)

    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=404)

    if game.is_finished:
        return Response({"error": "Game is already finished"}, status=400)

    if str(game.current_turn.id) != str(player_id):
        return Response({"error": "Not your turn"}, status=403)


    try:
        field = int(field)
        assert 1 <= field <= 9
    except:
        return Response({"error": "Field must be 1-9"}, status=400)

    field_name = f"field_{field}"


    if getattr(game, field_name) != "EMPTY":
        return Response({"error": "Field already taken"}, status=400)


    if str(game.player_1_id.id) == str(player_id):
        symbol = game.player_1_symbol
        next_turn = game.player_2_id
    else:
        symbol = game.player_2_symbol
        next_turn = game.player_1_id


    setattr(game, field_name, symbol)
    game.save()


    winner_symbol = check_winner(game)

    if winner_symbol == "X" or winner_symbol == "O":
        game.is_finished = True

        game.winner = (
            game.player_1_id if game.player_1_symbol == winner_symbol else game.player_2_id
        )
        game.save()

        return Response({
            "status": "WIN",
            "winner": winner_symbol,
            "winner_user_id": str(game.winner.id)
        })

    elif winner_symbol == "DRAW":
        game.is_finished = True
        game.winner = None
        game.save()

        return Response({"status": "DRAW"})


    game.current_turn = next_turn
    game.save()

    return Response({
        "status": "OK",
        "next_turn": str(next_turn.id)
    })

@api_view(["POST"])
def restart_game(request):
    game_id = request.data.get("game_id")

    if not game_id:
        return Response({"error": "game_id is required"}, status=400)

    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=404)


    for i in range(1, 10):
        setattr(game, f"field_{i}", "EMPTY")

    game.is_finished = False
    game.winner = None
    game.current_turn = game.player_1_id   #X zawsze zaczyna

    game.save()

    return Response({"status": "RESTARTED"})

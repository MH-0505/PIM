from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import User
from .serializers import UserSerializer
import hashlib

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
        return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    if hashed_password != user.hashed_password:
        return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({
        "id": str(user.id),
        "email": user.email
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

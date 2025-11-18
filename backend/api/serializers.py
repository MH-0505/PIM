from rest_framework import serializers
from .models import User
from .models import Chat
from .models import ChatParticipant
from .models import Message
import hashlib

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['hashed_password'] = hashlib.sha256(password.encode()).hexdigest()
        return super().create(validated_data)

class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'created_at']



class ChatParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatParticipant
        fields = ['chat_id', 'user_id']



class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source="sender_id.email", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "chat_id", "sender_id", "sender_email", "content", "sent_at"]

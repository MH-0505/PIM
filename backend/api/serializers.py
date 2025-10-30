from rest_framework import serializers
from .models import User
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

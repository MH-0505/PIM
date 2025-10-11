import uuid
from django.db import models

# Create your models here.

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    hashed_password = models.CharField(max_length=1024)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email


class Contact(models.Model):
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='contacts',
        db_column='user_id'
    )
    contact_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='contact_of',
        db_column='contact_id'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contacts'
        unique_together = ['user_id', 'contact_id']


    def __str__(self):
        return f"{self.user_id.email} -> {self.contact_id.email}"


class Chat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chats'

    def __str__(self):
        return f"Chat {self.id}"


class ChatParticipant(models.Model):
    chat_id = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='participants',
        db_column='chat_id'
    )
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='chat_participations',
        db_column='user_id'
    )

    class Meta:
        db_table = 'chat_participants'
        unique_together = ['chat_id', 'user_id']

    def __str__(self):
        return f"{self.user_id.email} in {self.chat_id}"


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat_id = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='messages',
        db_column='chat_id'
    )
    sender_id = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_messages',
        db_column='sender_id'
    )
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['sent_at']

    def __str__(self):
        sender = self.sender_id.email if self.sender_id else "Deleted user"
        return f"Message from {sender} at {self.sent_at}"



import uuid
from django.db import models

from django.core.exceptions import ValidationError

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




class Game(models.Model):
    SYMBOL_CHOICES = [
        ('EMPTY', 'Empty'),
        ('X', 'X'),
        ('O', 'O'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    player_1_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='games_as_player_1',
        db_column='player_1_id'
    )
    player_2_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='games_as_player_2',
        db_column='player_2_id'
    )

    player_1_symbol = models.CharField(max_length=5, choices=[('X', 'X'), ('O', 'O')])
    player_2_symbol = models.CharField(max_length=5, choices=[('X', 'X'), ('O', 'O')])


    field_1 = models.CharField(max_length=5, choices=SYMBOL_CHOICES, default='EMPTY')
    field_2 = models.CharField(max_length=5, choices=SYMBOL_CHOICES, default='EMPTY')
    field_3 = models.CharField(max_length=5, choices=SYMBOL_CHOICES, default='EMPTY')
    field_4 = models.CharField(max_length=5, choices=SYMBOL_CHOICES, default='EMPTY')
    field_5 = models.CharField(max_length=5, choices=SYMBOL_CHOICES, default='EMPTY')
    field_6 = models.CharField(max_length=5, choices=SYMBOL_CHOICES, default='EMPTY')
    field_7 = models.CharField(max_length=5, choices=SYMBOL_CHOICES, default='EMPTY')
    field_8 = models.CharField(max_length=5, choices=SYMBOL_CHOICES, default='EMPTY')
    field_9 = models.CharField(max_length=5, choices=SYMBOL_CHOICES, default='EMPTY')

    current_turn = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='games_current_turn',
        db_column='current_turn'
    )

    winner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='games_won',
        db_column='winner'
    )

    is_finished = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "games"

    def __str__(self):
        return f"Game {self.id} ({self.player_1_id.email} vs {self.player_2_id.email})"

    def clean(self):
        if self.player_1_symbol == self.player_2_symbol:
            raise ValidationError("Both players cannot have the same symbol!")

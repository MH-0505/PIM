import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";

const API_URL = "http://192.168.0.32:8000/api";

type Message = {
    id: string;
    sender_id: string;
    content: string;
    sent_at: string;
};

const ChatScreen = ({ route }: any) => {
    const { chatId, otherUserEmail } = route.params;

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string>("");

    const flatListRef = useRef<FlatList>(null);
    const navigation = useNavigation();


    const scrollToBottom = () => {
        flatListRef.current?.scrollToEnd({ animated: true });
    };


    useEffect(() => {
        (async () => {
            const uid = await AsyncStorage.getItem("user_id");
            if (uid) setCurrentUserId(uid);
        })();
    }, []);


    useEffect(() => {
        if (!currentUserId) return;

        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={{ marginRight: 10 }}
                    onPress={() => navigation.navigate("GameScreen" as never, {
                        player1Id: currentUserId,
                        player2Id: route.params.otherUserId
                    } as never)}
                >
                    <Text style={{ color: "#007AFF", fontSize: 16 }}>Game</Text>
                </TouchableOpacity>
            )
        });
    }, [currentUserId, navigation, route.params.otherUserId]);



    const loadMessages = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${API_URL}/messages/${chatId}/`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(data);
                scrollToBottom();
            } else {
                console.log("Error loading messages:", data);
            }

        } catch {
            console.log("Connection error loading messages.");
        }
    }, [chatId]);


    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 1500);
        return () => clearInterval(interval);
    }, [loadMessages]);


    const sendMessage = async () => {
        if (!inputText.trim()) return;

        try {
            const token = await AsyncStorage.getItem("token");
            const senderId = await AsyncStorage.getItem("user_id");

            const response = await fetch(`${API_URL}/messages/send/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    sender_id: senderId,
                    chat_id: chatId,
                    content: inputText
                })
            });

            if (response.ok) {
                setInputText("");
                loadMessages();
            } else {
                console.log("Error sending message");
            }

        } catch {
            console.log("Connection error sending message.");
        }
    };


    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.sender_id === currentUserId;

        return (
            <View
                style={[
                    styles.messageBubble,
                    isMe ? styles.myMessage : styles.theirMessage
                ]}
            >
                <Text style={styles.messageText}>{item.content}</Text>
                <Text style={styles.timeText}>
                    {new Date(item.sent_at).toLocaleTimeString().slice(0, 5)}
                </Text>
            </View>
        );
    };


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={90}
        >
            <View style={styles.header}>
                <Text style={styles.headerText}>{otherUserEmail}</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={scrollToBottom}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChatScreen;




const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa"
    },
    header: {
        padding: 15,
        backgroundColor: "#fff",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#ddd"
    },
    headerText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333"
    },
    messageList: {
        padding: 15,
        paddingBottom: 80
    },
    messageBubble: {
        maxWidth: "80%",
        padding: 10,
        borderRadius: 12,
        marginVertical: 6
    },
    myMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#007AFF"
    },
    theirMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#e5e5ea"
    },
    messageText: {
        color: "#fff",
        fontSize: 16
    },
    timeText: {
        color: "#ddd",
        fontSize: 12,
        marginTop: 4,
        textAlign: "right"
    },
    inputContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderColor: "#ddd"
    },
    input: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
        color: "#333"
    },
    sendButton: {
        marginLeft: 8,
        backgroundColor: "#007AFF",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 10,
        justifyContent: "center"
    },
    sendText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    }
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import NavBar from '../components/NavBar';
import AddContactForm from '../components/AddContactForm';
import { Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.32:8000/api';

//pytanie czy wydzielać panele, czy nie
const ChatPanel = () => (
    <View style={styles.panel}>
        <Text style={styles.title}>Chat Panel</Text>
    </View>
);


const ContactsPanel = ({ contacts }: any) => (
    <View style={styles.panel}>
        <Text style={styles.title}>Contacts</Text>

        {contacts.length === 0 ? (
            <Text style={styles.empty}>No contacts yet.</Text>
        ) : (
            contacts.map((c: any) => (
                <View key={c.id} style={styles.contactItem}>
                    <Text style={styles.contactEmail}>{c.email}</Text>
                </View>
            ))
        )}
    </View>
);


const ProfilePanel = () => (
    <View style={styles.panel}>
        <Text style={styles.title}>Profile Panel</Text>
    </View>
);

const HomeScreen = ({ navigation }: any) => {
    const [selectedPanel, setSelectedPanel] = useState('chat');
    const [modalVisible, setModalVisible] = useState(false);

    const [contacts, setContacts] = useState([]);


    const loadContacts = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const response = await fetch(`${API_URL}/contacts/list/`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            const data = await response.json();

            if (response.ok) {
                setContacts(data.contacts);
            } else {
                console.log("Error loading contacts:", data);
            }

        } catch (err) {
            console.log("Connection error loading contacts.");
        }
    };


    useEffect(() => {
        if (selectedPanel === "contacts") {
            loadContacts();
        }
    }, [selectedPanel]);


    useEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                selectedPanel === "contacts" ? (
                    <TouchableOpacity
                        style={{ marginRight: 12 }}
                        onPress={() => setModalVisible(true)}
                    >
                        <Plus size={28} color="#007AFF" />
                    </TouchableOpacity>
                ) : null,
        });
    }, [navigation, selectedPanel]);


    const handleAddContact = async (email: string) => {
        try {
            const token = await AsyncStorage.getItem("token");

            const response = await fetch(`${API_URL}/contacts/add/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert(data.error || "Failed to add contact");
                return;
            }

            Alert.alert("Contact added!");

            setModalVisible(false);


            loadContacts();

        } catch (err) {
            Alert.alert("Connection error");
        }
    };


    const renderPanel = () => {
        switch (selectedPanel) {
            case "chat": return <ChatPanel />;
            case "contacts": return <ContactsPanel contacts={contacts} />;
            case "profile": return <ProfilePanel />;
        }
    };

    return (
        <View style={styles.container}>
            {renderPanel()}

  
            <AddContactForm
                visible={modalVisible}
                onAdd={handleAddContact}
                onCancel={() => setModalVisible(false)}
            />


            <View style={styles.navBarContainer}>
                <NavBar selectedPanel={selectedPanel} setSelectedPanel={setSelectedPanel} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fafafa' },
    panel: { flex: 1, justifyContent: 'center', alignItems: 'center', width: "100%" },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },

    empty: { marginTop: 10, color: "#666", fontSize: 16 },

    contactItem: {
        width: "90%",
        padding: 12,
        marginVertical: 6,
        backgroundColor: "#fff",
        borderRadius: 10,
        elevation: 2
    },
    contactEmail: { fontSize: 16, color: "#333" },

    navBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0 }
});

export default HomeScreen;

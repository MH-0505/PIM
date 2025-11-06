import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NavBar from '../components/NavBar';

const ChatPanel = () => (
    <View style={styles.container}>
        <Text style={styles.title}>Chat Panel</Text>
    </View>
);

const ContactsPanel = () => (
    <View style={styles.container}>
        <Text style={styles.title}>Contacts Panel</Text>
    </View>
);

const ProfilePanel = () => (
    <View style={styles.container}>
        <Text style={styles.title}>Profile Panel</Text>
    </View>
);

const HomeScreen = () => {
    const [selectedPanel, setSelectedPanel] = useState('chat');

    const renderPanel = () => {
        switch (selectedPanel) {
            case 'chat':
                return <ChatPanel />;
            case 'contacts':
                return <ContactsPanel />;
            case 'profile':
                return <ProfilePanel />;
            default:
                return <ChatPanel />;
        }
    };

    return (
        <View style={styles.container}>
            {renderPanel()}
            <View style={styles.navBarContainer}>
                <NavBar selectedPanel={selectedPanel} setSelectedPanel={setSelectedPanel} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    navBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    }
});

export default HomeScreen;

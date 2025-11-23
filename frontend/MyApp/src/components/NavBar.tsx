import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';

const NavBar = ({ selectedPanel, setSelectedPanel }) => {
    const panels = ['chat', 'contacts', 'profile'];

    return (
        <View style={styles.buttonBar}>
            <TouchableOpacity style={styles.buttonContainer} onPress={() => setSelectedPanel(panels[0])}>
                <FontAwesome5 name="comments" size={24} color={selectedPanel === panels[0] ? "#007AFF" : "grey"} />
                <Text style={[styles.caption, { color: selectedPanel === panels[0] ? "#007AFF" : "grey" }]}>Czaty</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonContainer} onPress={() => setSelectedPanel(panels[1])}>
                <FontAwesome5 name="address-book" size={24} color={selectedPanel === panels[1] ? "#007AFF" : "grey"} />
                <Text style={[styles.caption, { color: selectedPanel === panels[1] ? "#007AFF" : "grey" }]}>Kontakty</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonContainer} onPress={() => setSelectedPanel(panels[2])}>
                <FontAwesome5 name="user" size={24} color={selectedPanel === panels[2] ? "#007AFF" : "grey"} />
                <Text style={[styles.caption, { color: selectedPanel === panels[2] ? "#007AFF" : "grey" }]}>Profil</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        width: '100%',
        height: 80,
        // Shadow for Android
        elevation: 5,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    buttonContainer: {
        alignItems: 'center',
        padding: 10,
    },
    caption: {
        fontSize: 12,
        paddingTop: 4,
    }
});

export default NavBar;

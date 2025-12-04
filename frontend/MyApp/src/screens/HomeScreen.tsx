import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert, TextInput} from 'react-native';
import NavBar from '../components/NavBar';
import AddContactForm from '../components/AddContactForm';
import ConfirmLogout from '../components/ConfirmLogout';
import {Plus, MessageCircle, DoorOpen, UserRoundCog, Search, UserRound } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "@env";

//PANELE

const ChatPanel = ({ chats, navigation, searchQuery }: any) => {
  const filteredChats = chats.filter((chat: any) =>
    chat.other_user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Twoje Czaty</Text>

      {filteredChats.length === 0 ? (
        <Text style={styles.empty}>Nie masz jeszcze żadnych czatów.</Text>
      ) : (
        filteredChats.map((chat: any) => (
          <TouchableOpacity
            key={chat.chat_id}
            style={styles.chatItem}
            onPress={() =>
              navigation.navigate('ChatScreen', {
                chatId: chat.chat_id,
                otherUserEmail: chat.other_user_email,
                otherUserId: chat.other_user_id,
              })
            }>
            <UserRound size="22" color="#999" strokeWidth="3.5" style={{marginLeft: -6, marginRight: 7}}/>
            <Text style={styles.chatText}>{chat.other_user_email}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const ContactsPanel = ({ contacts, onStartChat, searchQuery }: any) => {
  const filteredContacts = contacts.filter((c: any) =>
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Kontakty</Text>

      {filteredContacts.length === 0 ? (
        <Text style={styles.empty}>Nie masz jeszcze żadnych kontaktów.</Text>
      ) : (
        filteredContacts.map((c: any) => (
          <View key={c.id} style={styles.contactItem}>
            <UserRound size="22" color="#999" strokeWidth="3.5" style={{marginLeft: 0, marginRight: 7}}/>
            <Text style={styles.contactEmail}>{c.email}</Text>

            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => onStartChat(c.id)}>
              <MessageCircle size={22} color="#007AFF" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

const ProfilePanel = ({ onLogout, userEmail }: any) => (
  <View style={styles.userPanel}>
    <UserRoundCog style={styles.userIcon} size={150} color="#666" />
    <Text style={styles.title}>Panel Profilu</Text>
    <View style={styles.userInfo}>
      <Text style={styles.contactEmail}>Email</Text>
      <Text style={styles.contactEmail2}>{userEmail}</Text>
    </View>
    <TouchableOpacity style={styles.logOutButton} onPress={onLogout}>
      <Text style={styles.contactEmail}>Wyloguj się</Text>
      <DoorOpen size={22} color="#333" />
    </TouchableOpacity>
  </View>
);

//glowny

const HomeScreen = ({navigation}: any) => {
  const [selectedPanel, setSelectedPanel] = useState('chat');
  const [modalVisible, setModalVisible] = useState(false);

  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);

  const [logoutVisible, setLogoutVisible] = useState(false);

  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [contactsSearchQuery, setContactsSearchQuery] = useState('');

  const loadContacts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_URL}/contacts/list/`, {
        method: 'GET',
        headers: {Authorization: 'Bearer ' + token},
      });

      const data = await response.json();

      if (response.ok) setContacts(data.contacts);
      else console.log('Error loading contacts:', data);
    } catch (err) {
      console.log('Connection error loading contacts.');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user_id');
      navigation.replace('Login');
    } catch (e) {
      console.error('Error during logout:', e);
    }
  };


  const loadChats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) return;

      const response = await fetch(
        `${API_URL}/chats/user-chats-detailed/${userId}/`,
        {method: 'GET', headers: {Authorization: 'Bearer ' + token}},
      );

      const data = await response.json();

      if (response.ok) setChats(data);
      else console.log('Error loading chats:', data);
    } catch (err) {
      console.log('Connection error loading chats.');
    }
  };

  useEffect(() => {
    if (selectedPanel === 'contacts') loadContacts();
    if (selectedPanel === 'chat') loadChats();
  }, [selectedPanel]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        selectedPanel === 'contacts' ? (
          <TouchableOpacity
            style={{marginRight: 12}}
            onPress={() => setModalVisible(true)}>
            <Plus size={28} color="#007AFF" />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, selectedPanel]);

  useEffect(() => {
    const loadUserEmail = async () => {
      const email = await AsyncStorage.getItem('user_email');
      setUserEmail(email);
    };

    loadUserEmail();
  }, []);

  const handleAddContact = async (email: string) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_URL}/contacts/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({email}),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(data.error || 'Failed to add contact');
        return;
      }

      Alert.alert('Contact added!');
      setModalVisible(false);
      loadContacts();
    } catch (err) {
      Alert.alert('Connection error');
    }
  };

  const startChatWithUser = async (contactUserId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('user_id');

      if (!userId) {
        Alert.alert('Error', 'User ID not found');
        return;
      }

      const response = await fetch(`${API_URL}/chats/create-one-on-one/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          user_id_1: userId,
          user_id_2: contactUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.error || 'Failed to open chat');
        return;
      }

      navigation.navigate('ChatScreen', {
        chatId: data.chat_id,
        otherUserEmail: data.other_user_email,
        otherUserId: contactUserId,
      });

      loadChats();
    } catch (err) {
      Alert.alert('Connection error');
    }
  };

  const renderPanel = () => {
    switch (selectedPanel) {
      case 'chat':
        return <ChatPanel chats={chats} navigation={navigation} searchQuery={chatSearchQuery} />;

      case 'contacts':
        return (
          <ContactsPanel contacts={contacts} onStartChat={startChatWithUser} searchQuery={contactsSearchQuery} />
        );

      case 'profile':
        return <ProfilePanel onLogout={() => setLogoutVisible(true)}
        userEmail={userEmail}
         />;
    }
  };

  return (
     <View style={styles.container}>
      {selectedPanel === 'chat' && (
        <View style={{paddingTop: 10, paddingBottom: 10, flexDirection: 'row', backgroundColor: '#d4d4d4ff', }}>
          <Search size={30} strokeWidth={4} color="#666" style={{margin: 10}}/>
          <TextInput
            placeholder="Szukaj czatów..."
            value={chatSearchQuery}
            onChangeText={setChatSearchQuery}
            style={{
              flex: 1,
              backgroundColor: '#d4d4d4ff',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginRight: 20,
              borderWidth: 1,
              borderColor: '#d4d4d4ff',
              fontSize: 17,
            }}
            placeholderTextColor="#666"
          />
        </View>
      )}

      {selectedPanel === 'contacts' && (
        <View style={{paddingTop: 10, paddingBottom: 10, flexDirection: 'row', backgroundColor: '#d4d4d4ff', }}>
          <Search size={30} strokeWidth={4} color="#666" style={{margin: 10}}/>
          <TextInput
            placeholder="Szukaj kontaktów..."
            value={contactsSearchQuery}
            onChangeText={setContactsSearchQuery}
            style={{
              flex: 1,
              backgroundColor: '#d4d4d4ff',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginRight: 20,
              borderWidth: 1,
              borderColor: '#d4d4d4ff',
              fontSize: 17,
            }}
            placeholderTextColor="#666"
          />
        </View>
      )}

      {renderPanel()}

      <AddContactForm
        visible={modalVisible}
        onAdd={handleAddContact}
        onCancel={() => setModalVisible(false)}
      />

      <ConfirmLogout
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={async () => {
          setLogoutVisible(false);
          await logout();
        }}
      />

      <View style={styles.navBarContainer}>
        <NavBar
          selectedPanel={selectedPanel}
          setSelectedPanel={setSelectedPanel}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fafafa'},

  panel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  userPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: '-30%',
  },

  userIcon: {
    marginBottom: '5%',
  },

  userInfo: {
    width: '90%',
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#dfdfdfff',
    borderRadius: 10,
    elevation: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },


  logOutButton: {
    width: '90%',
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logOutButton2: {padding: 6},

  LogOutIcon: {
    alignSelf:'flex-end',
  },

  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20},

  empty: {marginTop: 10, color: '#666', fontSize: 16},

  contactItem: {
    width: '90%',
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },

  contactEmail: {fontSize: 16, color: '#333'},

  contactEmail2: {fontSize: 16, color: '#333', fontWeight: '500'},

  chatButton: {marginLeft: 'auto', padding: 6},

  chatItem: {
    width: '90%',
    padding: 18,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    flexDirection: 'row'
  },

  chatText: {fontSize: 16, color: '#333'},

  navBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default HomeScreen;

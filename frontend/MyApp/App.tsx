import * as React from 'react';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ChatScreen from './src/screens/ChatScreen';
import GameScreen from './src/screens/GameScreen';

type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
    ChatScreen: {
        chatId: string;
        otherUserEmail: string;
        currentUserId: string;
        otherUserId: string;
    };
    GameScreen: {
        player1Id: string;
        player2Id: string;
    };
};


enableScreens();
const Stack = createNativeStackNavigator<RootStackParamList>();


export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">

                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />

                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ headerShown: false }}
                />

                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: "Strona główna" }}
                />

                <Stack.Screen
                    name="ChatScreen"
                    component={ChatScreen}
                    options={({ route }) => ({
                        title: route.params.otherUserEmail
                    })}
                />

                <Stack.Screen
                    name="GameScreen"
                    component={GameScreen}
                    options={{ title: "Game" }}
                />


            </Stack.Navigator>
        </NavigationContainer>
    );
}

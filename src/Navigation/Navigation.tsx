import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TodoScreen from '../screens/TodoScreen';
import TodoDetailsScreen from '../screens/TodoDetailsScreen';

export type RootStackParamList = {
    Todo: undefined;
    TodoDetails: undefined // example param for Details screen
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Todo" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Todo" component={TodoScreen} />
                <Stack.Screen name="TodoDetails" component={TodoDetailsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Navigation;

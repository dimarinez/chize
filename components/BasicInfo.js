
import React, {useEffect} from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';

const BasicInfo = ({navigation}) => {
    useEffect(() => {

    }, []);

    return (
        <View style={styles.container}>
            <Button title="Enter Basic Info" onPress={() => {
                navigation.navigate('ProfileEdit');
            }
            } />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      marginHorizontal: 20,
      marginTop: 20,
      paddingTop: 30,
    }
});


export default BasicInfo;

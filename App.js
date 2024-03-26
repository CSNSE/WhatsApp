import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Navigator from './src/navigation/Navigator';
// App.js
import { withAuthenticator } from "aws-amplify-react-native";
import awsconfig from './src/aws-exports'

import { Amplify } from 'aws-amplify'

Amplify.configure({ ...awsconfig, Analytics: { disabled: true } });
function App() {
  return (
    <View style={styles.container}>
      <Navigator />

      <StatusBar style="auto" />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
    justifyContent: 'center',
  },
});

export default withAuthenticator(App);
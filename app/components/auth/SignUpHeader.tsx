import { View, Text } from "react-native";
import styles from "./styles";

export default function SignUpHeader() {
  return (
    <View style={styles.SignInHeader}>
      <Text style={styles.headerTitle}>Create Account</Text>
    </View>
  );
}

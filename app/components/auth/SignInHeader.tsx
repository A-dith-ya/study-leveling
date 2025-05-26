import { View, Text, Image } from "react-native";
import styles from "./styles";

export default function SignInHeader() {
  return (
    <View style={styles.SignInHeader}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>Study Leveling</Text>
      </View>
      <Text style={styles.headerSubtitle}>Please sign in to continue</Text>
    </View>
  );
}

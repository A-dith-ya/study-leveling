import { View, Text } from "react-native";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import styles from "./styles";

export default function SignUpFooter() {
  const { toSignIn } = useAuthenticator();
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Already have an account?{" "}
        <Text style={styles.signupLink} onPress={toSignIn}>
          Sign in
        </Text>
      </Text>
    </View>
  );
}

import { View, Text } from "react-native";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import styles from "./styles";

export default function SignInFooter() {
  const { toSignUp } = useAuthenticator();

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Don't have an account?{" "}
        <Text style={styles.signupLink} onPress={toSignUp}>
          Sign up
        </Text>
      </Text>
    </View>
  );
}

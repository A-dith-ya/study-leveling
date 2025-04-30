import { View, Button } from "react-native";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import styles from "./styles";

export default function SignOutButton() {
  const { signOut } = useAuthenticator();

  return (
    <View style={styles.signOutButton}>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}

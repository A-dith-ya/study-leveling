import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  SignInHeader: {
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerTitle: {
    fontSize: 28,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: COLORS.darkGray,
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    textAlign: "center",
  },
  signupLink: {
    color: COLORS.secondary,
    fontWeight: "bold",
  },
  signInFooter: {
    alignItems: "center",
    marginTop: 20,
  },
});

export default styles;

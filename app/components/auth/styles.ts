import { StyleSheet, Dimensions } from "react-native";
import COLORS from "../../constants/colors";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  SignInHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 18,
    textAlign: "center",
    color: COLORS.darkGray,
    marginTop: 8,
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  footer: {
    padding: 20,
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 16,
    textAlign: "center",
    color: COLORS.darkGray,
    lineHeight: 22,
  },
  signupLink: {
    color: COLORS.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
});

export default styles;

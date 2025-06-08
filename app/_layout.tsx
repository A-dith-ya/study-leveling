import { Stack } from "expo-router";
import { Amplify } from "aws-amplify";
import { Authenticator, ThemeProvider } from "@aws-amplify/ui-react-native";
import { I18n } from "aws-amplify/utils";
import { translations } from "@aws-amplify/ui";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import COLORS from "./constants/colors";
import SignInHeader from "./components/auth/SignInHeader";
import SignInFooter from "./components/auth/SignInFooter";
import SignUpHeader from "./components/auth/SignUpHeader";
import SignUpFooter from "./components/auth/SignUpFooter";
import AppInitializer from "./components/auth/AppInitializer";
import { clientPersister } from "./services/mmkv";

const getAmplifyConfig = () => {
  if (process.env.EXPO_PUBLIC_AMPLIFY_ENV === "production") {
    return require("../amplify_outputs.json");
  } else {
    return require("../amplify_outputs.json");
  }
};

Amplify.configure(getAmplifyConfig());

const theme = {
  tokens: {
    colors: {
      primary: {
        10: COLORS.primary,
        20: COLORS.primary,
        40: COLORS.primary,
        60: COLORS.primary,
        80: COLORS.primary,
        90: COLORS.primary,
        100: COLORS.primary,
      },
    },
  },
};

I18n.putVocabularies(translations);
I18n.setLanguage("en");
// Override default component strings in Amplify UI
I18n.putVocabularies({
  en: {
    "Sign in": "Login",
    "Create Account": "Sign Up",
    "Forgot your password?": "Forgot Password?",
    "Reset your password": "Reset Password",
    "Enter your email": "Enter your email address",
    "Send code": "Send Reset Code",
    Code: "Verification Code",
    "New Password": "New Password",
    "Confirm Password": "Confirm New Password",
    Submit: "Reset Password",
    "Back to Sign In": "← Back to Login",
    "We Emailed You": "Check Your Email!",
    "Your code is on the way. To log in, enter the code we emailed to":
      "We've sent a verification code to your email address. Please check your inbox and enter the code below:",
    "It may take a minute to arrive.":
      "If you don't see the email, please check your spam folder or wait a minute for it to arrive.",
    "Lost your code?": "Didn't receive the code?",
    "Resend Code": "Resend Code",
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: clientPersister }}
    >
      <ThemeProvider theme={theme}>
        <Authenticator.Provider>
          <AppInitializer />
          <Authenticator
            components={{
              SignIn: (props) => (
                <Authenticator.SignIn
                  {...props}
                  Header={SignInHeader}
                  Footer={SignInFooter}
                  hideSignUp={true}
                  fields={[
                    {
                      name: "username",
                      labelHidden: true,
                      placeholder: "Email address",
                      type: "email",
                      style: {
                        marginBottom: 16,
                      },
                    },
                    {
                      name: "password",
                      labelHidden: true,
                      placeholder: "Password",
                      type: "password",
                    },
                  ]}
                />
              ),
              SignUp: (props) => (
                <Authenticator.SignUp
                  {...props}
                  Header={SignUpHeader}
                  Footer={SignUpFooter}
                  hideSignIn={true}
                  fields={[
                    {
                      name: "email",
                      labelHidden: true,
                      placeholder: "Email address",
                      type: "email",
                      style: {
                        marginBottom: 16,
                      },
                    },
                    {
                      name: "password",
                      labelHidden: true,
                      placeholder: "Create password (min 6 characters)",
                      type: "password",
                      style: {
                        marginBottom: 16,
                      },
                    },
                    {
                      name: "confirm_password",
                      labelHidden: true,
                      placeholder: "Confirm password",
                      type: "password",
                    },
                  ]}
                />
              ),
            }}
          >
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(amain)" />
              <Stack.Screen name="(flashcard)" />
            </Stack>
          </Authenticator>
          <AppInitializer />
        </Authenticator.Provider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}

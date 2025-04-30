import { Amplify } from "aws-amplify";
import { Authenticator, ThemeProvider } from "@aws-amplify/ui-react-native";
import { I18n } from "aws-amplify/utils";
import { translations } from "@aws-amplify/ui";

import outputs from "../amplify_outputs.json";

import COLORS from "./constants/colors";
import SignInHeader from "./components/auth/SignInHeader";
import SignInFooter from "./components/auth/SignInFooter";
import SignUpHeader from "./components/auth/SignUpHeader";
import SignUpFooter from "./components/auth/SignUpFooter";
import SignOutButton from "./components/auth/SignOutButton";

Amplify.configure(outputs);

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
  },
});

export default function Index() {
  return (
    <ThemeProvider theme={theme}>
      <Authenticator.Provider>
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
                    placeholder: "Email",
                    type: "default",
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
              />
            ),
          }}
        >
          <SignOutButton />
        </Authenticator>
      </Authenticator.Provider>
    </ThemeProvider>
  );
}

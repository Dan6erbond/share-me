import { useAuthMethods } from "@/hooks/useAuthMethods";
import { pocketBaseUrl, usePocketBase } from "@/pocketbase";
import {
  Anchor,
  Box,
  Button,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  SiApple,
  SiDiscord,
  SiFacebook,
  SiGitea,
  SiGithub,
  SiGitlab,
  SiGoogle,
  SiKakao,
  SiLivechat,
  SiMicrosoft,
  SiOpenid,
  SiSpotify,
  SiStrava,
  SiTwitch,
  SiTwitter,
} from "react-icons/si";
import Head from "@/components/head";

const authProviderIcons: Record<string, JSX.Element> = {
  apple: <SiApple />,
  google: <SiGoogle />,
  facebook: <SiFacebook />,
  microsoft: <SiMicrosoft />,
  github: <SiGithub />,
  gitlab: <SiGitlab />,
  gitea: <SiGitea />,
  discord: <SiDiscord />,
  twitter: <SiTwitter />,
  kakao: <SiKakao />,
  spotify: <SiSpotify />,
  twitch: <SiTwitch />,
  strava: <SiStrava />,
  livechat: <SiLivechat />,
  oidc: <SiOpenid />,
  oidc2: <SiOpenid />,
  oidc3: <SiOpenid />,
};

interface LoginForm {
  username: string;
  password: string;
}

function Login() {
  const pb = usePocketBase();
  const router = useRouter();

  const form = useForm<LoginForm>();
  const [loginError, setLoginError] = useState("");
  const { usernamePasswordEnabled, authProviders } = useAuthMethods();

  const login = async ({ username, password }: LoginForm) => {
    try {
      await pb.collection("users").authWithPassword(username, password);
      router.push("/");
    } catch (ex: any) {
      if (!ex.response) {
        return;
      }
      const { data, message } = ex.response;
      if (data) {
        form.setFieldError("username", data.identity?.message);
        form.setFieldError("password", data.password?.message);
      }
      if (message) {
        setLoginError(message);
      }
    }
  };

  return (
    <>
      <Head pageTitle="Login" />
      <Box>
        <Group position="center" h="100vh">
          <form onSubmit={form.onSubmit(login)}>
            <Stack>
              {usernamePasswordEnabled && (
                <>
                  <Title>Share Me</Title>
                  <Title order={3} color="gray.5">
                    Login
                  </Title>
                  <TextInput
                    label="Username"
                    miw="300px"
                    {...form.getInputProps("username")}
                  />
                  <PasswordInput
                    label="Password"
                    miw="300px"
                    {...form.getInputProps("password")}
                  />
                  {loginError && <Text color="red">{loginError}</Text>}
                  <Divider />
                </>
              )}
              {authProviders?.map((provider) => (
                <Button
                  leftIcon={authProviderIcons[provider.name]}
                  key={provider.name}
                  onClick={() =>
                    pb
                      .collection("users")
                      .authWithOAuth2({ provider: provider.name })
                      .then(() => router.push("/"))
                      .catch((ex) => {
                        console.error(ex);
                        notifications.show({
                          color: "red",
                          title: "An error occured",
                          message: "Please contact the developers",
                          icon: <IconAlertCircle />,
                        });
                      })
                  }
                >
                  Sign in with {provider.name}
                </Button>
              ))}
              {usernamePasswordEnabled && (
                <Group sx={{ justifyContent: "space-between" }}>
                  <Anchor component={Link} href="/sign-up">
                    Sign Up
                  </Anchor>
                  <Button variant="gradient" type="submit">
                    Log In
                  </Button>
                </Group>
              )}
            </Stack>
          </form>
        </Group>
      </Box>
    </>
  );
}

export default Login;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: pocketBaseUrl({}),
  };
};

import { useAuthMethods } from "@/hooks/useAuthMethods";
import { pocketBaseUrl, usePocketBase } from "@/pocketbase";
import {
  Anchor,
  Box,
  Button,
  Group,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "@/components/head";

interface SignUpForm {
  email: string;
  username: string;
  password: string;
  passwordConfirm: string;
}

function SignUp() {
  const pb = usePocketBase();
  const router = useRouter();

  const { usernamePasswordEnabled } = useAuthMethods();

  useEffect(() => {
    if (!usernamePasswordEnabled) router.push("/login");
  }, [usernamePasswordEnabled, router]);

  const form = useForm<SignUpForm>({
    validate: {
      passwordConfirm: (value, values) =>
        value === values.password ? null : "Passwords must match",
    },
  });

  const signUp = async ({
    email,
    username,
    password,
    passwordConfirm,
  }: SignUpForm) => {
    try {
      await pb.collection("users").create({
        email,
        username,
        password,
        passwordConfirm,
      });
      await pb.collection("users").authWithPassword(email, password);
      router.push("/");
    } catch (ex: any) {
      if (!ex.response) {
        return;
      }
      const { data } = ex.response;
      if (data) {
        form.setFieldError("email", data.email.message);
        form.setFieldError("username", data.username?.message);
        form.setFieldError("password", data.password?.message);
        form.setFieldError("passwordConfirm", data.passwordConfirm?.message);
      }
    }
  };

  return (
    <>
      <Head pageTitle="Sign Up" />
      <Box>
        <Group position="center" h="100vh">
          <form onSubmit={form.onSubmit(signUp)}>
            <Stack>
              <Title>Share Me</Title>
              <Title order={3} color="gray.5">
                Sign Up
              </Title>
              <TextInput
                label="Email"
                {...form.getInputProps("email")}
                miw="300px"
                type="email"
              />
              <TextInput
                label="Username"
                {...form.getInputProps("username")}
                miw="300px"
              />
              <PasswordInput
                label="Password"
                {...form.getInputProps("password")}
                miw="300px"
              />
              <PasswordInput
                label="Repeat password"
                {...form.getInputProps("passwordConfirm")}
                miw="300px"
              />
              <Group sx={{ justifyContent: "space-between" }}>
                <Anchor component={Link} href="/login">
                  Log In
                </Anchor>
                <Button variant="gradient" type="submit">
                  Sign Up
                </Button>
              </Group>
            </Stack>
          </form>
        </Group>
      </Box>
    </>
  );
}

export default SignUp;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: pocketBaseUrl({}),
  };
};

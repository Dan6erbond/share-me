import { usePocketBase } from "@/pocketbase";
import {
  Anchor,
  Box,
  Button,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

interface LoginForm {
  username: string;
  password: string;
}

function Login() {
  const pb = usePocketBase();
  const router = useRouter();

  const form = useForm<LoginForm>();
  const [loginError, setLoginError] = useState("");

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
    <Box>
      <Group position="center" h="100vh">
        <form onSubmit={form.onSubmit(login)}>
          <Stack>
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
            <Group>
              <Anchor component={Link} href="/sign-up">
                Sign Up
              </Anchor>
              <Button variant="gradient" type="submit">
                Log In
              </Button>
            </Group>
          </Stack>
        </form>
      </Group>
    </Box>
  );
}

export default Login;

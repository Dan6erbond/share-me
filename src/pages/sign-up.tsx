import { usePocketBase } from "@/pocketbase";
import {
  Anchor,
  Box,
  Button,
  Group,
  PasswordInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { useRouter } from "next/router";

interface SignUpForm {
  email: string;
  username: string;
  password: string;
  passwordConfirm: string;
}

function SignUp() {
  const pb = usePocketBase();
  const router = useRouter();

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
    <Box>
      <Group position="center" h="100vh">
        <form onSubmit={form.onSubmit(signUp)}>
          <Stack>
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
  );
}

export default SignUp;
